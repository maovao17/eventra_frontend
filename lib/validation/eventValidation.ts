interface EventData {
  name?: string
  date?: string
  location?: string
  budget?: string | number
  [key: string]: unknown
}

export function validateEvent(data: EventData) {
  const errors: Record<string, string> = {}

  if (!data.name || data.name.trim() === "") {
    errors.name = "Name required"
  }

  if (!data.date || data.date.trim() === "") {
    errors.date = "Date required"
  }

  if (data.budget === undefined || data.budget === "" || isNaN(Number(data.budget)) || Number(data.budget) <= 0) {
    errors.budget = "Valid budget required"
  }

  return errors
}
