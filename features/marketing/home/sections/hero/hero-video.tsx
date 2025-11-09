export function HeroVideo() {
  return (
    <div className="w-full max-w-5xl">
      <div className="relative aspect-video overflow-hidden rounded-2xl border border-border/60 bg-muted/50 shadow-2xl">
        <iframe
          src="https://player.vimeo.com/video/1056202703?h=01e221aff0&autoplay=1&muted=1&loop=1&background=1&controls=0&badge=0&autopause=0&app_id=58479"
          className="absolute top-0 left-0 h-full w-full"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title="Zenith Branding Video Presentation"
          aria-label="Zenith's brand showcase video"
        />
      </div>
    </div>
  )
}
