export interface OpenCheckResult {
    isOpenNow: boolean
    reason: string
  }
  
  export const isRestaurantOpen = (
    weekdayOpen: string,
    weekdayClose: string,
    weekendOpen?: string,
    weekendClose?: string,
    temporarilyClosed?: boolean
  ): OpenCheckResult => {
    const today = new Date()
    const isWeekend = today.getDay() === 0 || today.getDay() === 6

    const openStr = isWeekend && weekendOpen ? weekendOpen : weekdayOpen
    const closeStr = isWeekend && weekendClose ? weekendClose : weekdayClose

    if (!openStr || !closeStr)
      return { isOpenNow: false, reason: "No hours set" }

    const parseTime = (timeStr: string): Date | null => {
      try {
        if (/\d{4}-\d{2}-\d{2}T/.test(timeStr)) {
          const d = new Date(timeStr)
          return Number.isNaN(d.getTime()) ? null : d
        }

        const d = new Date(`${today.toDateString()} ${timeStr}`)
        return Number.isNaN(d.getTime()) ? null : d
      } catch {
        return null
      }
    }

    const open = parseTime(openStr)
    const close = parseTime(closeStr)
    if (!open || !close) return { isOpenNow: false, reason: "Invalid hours" }

    // If close < open, treat close as next day (overnight hours)
    const adjustedClose = new Date(close)
    if (close < open) adjustedClose.setDate(adjustedClose.getDate() + 1)

    const now = new Date()
    const withinHours =
      now >= open && now <= adjustedClose ||
      (close < open && (now >= open || now <= adjustedClose))
  
    if (!withinHours)
      return { isOpenNow: false, reason: "Closed (Outside Hours)" }
    if (temporarilyClosed)
      return { isOpenNow: false, reason: "Temporarily Closed" }
  
    return { isOpenNow: true, reason: "Open Now" }
  }
  