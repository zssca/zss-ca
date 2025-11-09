#!/usr/bin/env python3
"""Generate TypeScript types from the Supabase database.

This script generates strongly typed database definitions for the ZSS codebase.
It supports multiple generation methods:
1. Supabase CLI (primary)
2. Direct database connection (fallback)

Usage:
    python scripts/generate-supabase-types.py
    python scripts/generate-supabase-types.py --schema public --schema storage
    python scripts/generate-supabase-types.py --db-url "postgresql://..."

Environment Variables Required (in .env.local):
    - NEXT_PUBLIC_SUPABASE_URL
    - SUPABASE_SERVICE_ROLE_KEY (for direct connection fallback)
"""

from __future__ import annotations

import argparse
import os
import re
import shutil
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Sequence

# Project paths
PROJECT_ROOT = Path(__file__).resolve().parents[1]
ENV_FILE = PROJECT_ROOT / ".env.local"
OUTPUT_FILE = PROJECT_ROOT / "lib" / "types" / "database.types.ts"


class GenerationError(RuntimeError):
    """Custom error raised when type generation fails."""


def parse_args() -> argparse.Namespace:
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="Generate Supabase TypeScript types",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Generate types for public schema (default)
  python scripts/generate-supabase-types.py

  # Generate types for multiple schemas
  python scripts/generate-supabase-types.py --schema public --schema storage

  # Use direct database connection
  python scripts/generate-supabase-types.py --db-url "postgresql://..."
        """,
    )
    parser.add_argument(
        "--schema",
        dest="schemas",
        action="append",
        default=[],
        help="Schema to include (can be provided multiple times, default: public)",
    )
    parser.add_argument(
        "--output",
        dest="output",
        type=Path,
        default=OUTPUT_FILE,
        help=f"Path to write the generated types (default: {OUTPUT_FILE.relative_to(PROJECT_ROOT)})",
    )
    parser.add_argument(
        "--db-url",
        dest="db_url",
        type=str,
        default=None,
        help="Postgres connection string (fallback if CLI fails)",
    )
    parser.add_argument(
        "--verbose",
        "-v",
        action="store_true",
        help="Show verbose output",
    )
    return parser.parse_args()


def load_env_file(path: Path) -> dict[str, str]:
    """Load environment variables from .env.local file."""
    if not path.exists():
        raise GenerationError(f"Missing environment file: {path}")

    env: dict[str, str] = {}
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        # Skip empty lines and comments
        if not line or line.startswith("#"):
            continue
        if "=" not in line:
            continue
        key, _, value = line.partition("=")
        # Remove quotes from values
        value = value.strip().strip('"').strip("'")
        env[key.strip()] = value
    return env


def extract_project_id(supabase_url: str) -> str:
    """Extract project ID from Supabase URL.

    Example: https://abcdefghijklmnop.supabase.co -> abcdefghijklmnop
    """
    match = re.search(r"https?://([^.]+)\.supabase\.co", supabase_url)
    if not match:
        raise GenerationError(
            f"Could not extract project ID from URL: {supabase_url}"
        )
    return match.group(1)


def ensure_required_env(env: dict[str, str]) -> None:
    """Validate required environment variables exist."""
    if not env.get("NEXT_PUBLIC_SUPABASE_URL"):
        raise GenerationError(
            "Missing NEXT_PUBLIC_SUPABASE_URL in .env.local"
        )

    # Set environment variables for subprocess
    for key, value in env.items():
        os.environ.setdefault(key, value)


def resolve_cli_command() -> Sequence[str]:
    """Find the Supabase CLI executable."""
    # Check if installed globally
    executable = shutil.which("supabase")
    if executable:
        return [executable]

    # Check if npx is available
    npx = shutil.which("npx")
    if npx:
        return [npx, "--yes", "supabase"]

    raise GenerationError(
        "Supabase CLI not found. Install with: npm install -g supabase"
    )


def merge_schemas(*schema_iterables) -> List[str]:
    """Merge schema lists, ensuring 'public' is always first."""
    result: List[str] = []
    for iterable in schema_iterables:
        for schema in iterable:
            if schema and schema not in result:
                result.append(schema)

    # Ensure 'public' is first
    if "public" not in result:
        result.insert(0, "public")
    elif result[0] != "public":
        result.remove("public")
        result.insert(0, "public")

    return result


def run_supabase_gen(
    cli_cmd: Sequence[str],
    schemas: List[str],
    *,
    project_id: Optional[str] = None,
    db_url: Optional[str] = None,
    verbose: bool = False,
) -> str:
    """Run the Supabase CLI to generate types."""
    if not project_id and not db_url:
        raise ValueError("Either project_id or db_url must be provided")

    command: List[str] = list(cli_cmd) + ["gen", "types", "typescript"]

    if project_id:
        command.extend(["--project-id", project_id])
    if db_url:
        command.extend(["--db-url", db_url])

    # Add schemas
    for schema in schemas:
        command.extend(["--schema", schema])

    if verbose:
        print(f"  Command: {' '.join(command)}")

    # Run the command
    result = subprocess.run(
        command,
        cwd=str(PROJECT_ROOT),
        capture_output=True,
        text=True,
        check=False,
    )

    if result.returncode != 0:
        stderr = result.stderr.strip() or "Unknown error"
        raise GenerationError(f"Supabase CLI failed: {stderr}")

    output = result.stdout.strip()
    if not output:
        raise GenerationError("Supabase CLI returned no output")

    return output


def format_with_prettier(content: str) -> str:
    """Format TypeScript content with Prettier."""
    try:
        process = subprocess.run(
            [
                "npx",
                "--yes",
                "prettier@latest",
                "--parser",
                "typescript",
            ],
            input=content,
            text=True,
            capture_output=True,
            check=True,
        )
        return process.stdout
    except Exception:
        # Return unformatted if Prettier fails
        return content


def write_types(content: str, destination: Path, schemas: List[str]) -> None:
    """Write the generated types to the destination file."""
    destination.parent.mkdir(parents=True, exist_ok=True)

    # Add header comment
    header = f"""/**
 * Supabase Database Types
 *
 * Generated: {datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")}
 * Schemas: {", ".join(schemas)}
 *
 * DO NOT EDIT THIS FILE MANUALLY.
 * Run `python scripts/generate-supabase-types.py` to regenerate.
 *
 * Best Practices:
 * 1. Never manually edit this file
 * 2. Regenerate after any database schema changes
 * 3. Use type helpers for complex queries:
 *    - Tables<'tableName'> for row types
 *    - TablesInsert<'tableName'> for inserts
 *    - TablesUpdate<'tableName'> for updates
 * 4. Create wrapper types in separate files for business logic
 */

"""

    destination.write_text(header + content, encoding="utf-8")


def main() -> int:
    """Main entry point."""
    args = parse_args()

    try:
        # Load environment
        if args.verbose:
            print(f"Loading environment from {ENV_FILE.relative_to(PROJECT_ROOT)}")
        env = load_env_file(ENV_FILE)
        ensure_required_env(env)

        # Determine project ID
        supabase_url = env["NEXT_PUBLIC_SUPABASE_URL"]
        project_id = extract_project_id(supabase_url)

        # Merge schemas
        schemas = merge_schemas(args.schemas or ["public"])

        # Find CLI command
        cli_command = resolve_cli_command()

        print("🔄 Generating Supabase TypeScript types...")
        print(f"   Project ID: {project_id}")
        print(f"   Schemas: {', '.join(schemas)}")
        print(f"   Output: {args.output.relative_to(PROJECT_ROOT)}")

        # Try primary method: Supabase CLI with project ID
        content = None
        try:
            if args.verbose:
                print("   Method: Supabase CLI (remote project)")
            content = run_supabase_gen(
                cli_command,
                schemas,
                project_id=project_id,
                verbose=args.verbose,
            )
        except GenerationError as exc:
            if args.verbose:
                print(f"   CLI generation failed: {exc}")

            # Try fallback: direct database connection
            db_url = args.db_url or env.get("DATABASE_URL")
            if db_url:
                print("   Trying fallback: direct database connection")
                try:
                    content = run_supabase_gen(
                        cli_command,
                        schemas,
                        db_url=db_url,
                        verbose=args.verbose,
                    )
                except GenerationError as fallback_exc:
                    raise GenerationError(
                        f"Both primary and fallback methods failed. "
                        f"Primary: {exc}. Fallback: {fallback_exc}"
                    ) from fallback_exc
            else:
                raise

        if not content:
            raise GenerationError("No content generated")

        # Format with Prettier
        if args.verbose:
            print("   Formatting with Prettier...")
        formatted_content = format_with_prettier(content)

        # Write to file
        write_types(formatted_content, args.output, schemas)

        print(f"✅ Types generated successfully!")
        print(f"   File: {args.output.relative_to(PROJECT_ROOT)}")

        # Show stats
        lines = formatted_content.count('\n')
        print(f"   Lines: {lines:,}")

        # List some tables found
        table_matches = re.findall(r"^\s+(\w+):\s*{$", formatted_content, re.MULTILINE)
        if table_matches and args.verbose:
            print(f"   Tables found: {len(table_matches)}")
            print(f"   Sample: {', '.join(table_matches[:5])}...")

        return 0

    except GenerationError as exc:
        print(f"❌ Error: {exc}", file=sys.stderr)
        return 1
    except KeyboardInterrupt:
        print("\n⚠️  Interrupted by user", file=sys.stderr)
        return 130
    except Exception as exc:
        print(f"❌ Unexpected error: {exc}", file=sys.stderr)
        if args.verbose:
            import traceback
            traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())
