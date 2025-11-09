export interface ContactFormData {
  heading: string
  description: string
  submitLabel: string
  successMessage: string
  privacyNote: string
  marketingOptInLabel: string
  serviceOptions: ServiceOption[]
}

export interface ServiceOption {
  value: string
  label: string
}
