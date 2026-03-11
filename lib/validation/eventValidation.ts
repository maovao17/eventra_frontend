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
    errors.name = "Event name is required"
  }

  if (!data.date || data.date.trim() === "") {
    errors.date = "Date is required"
  }

  if (!data.location || data.location.trim() === "") {
    errors.location = "Location is required"
  }

  if (data.budget === undefined || data.budget === "" || isNaN(Number(data.budget))) {
    errors.budget = "Valid budget is required"
  }

  return errors
}
