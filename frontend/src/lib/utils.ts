import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { MeetingTime } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMeetingTimes(meetingTimes: MeetingTime[]) {
  
  // Group meeting times by begin_time and end_time
  const timeGroups: { [key: string]: string[] } = {};

  meetingTimes.forEach(meeting => {
    const timeKey = `${meeting.begin_time}-${meeting.end_time}`;
    const day = meeting.days[0].charAt(0).toUpperCase() + meeting.days[0].slice(1); // Capitalize day

    if (timeGroups[timeKey]) {
        timeGroups[timeKey].push(day);
    } else {
        timeGroups[timeKey] = [day];
    }
  });

  const formattedGroups = Object.entries(timeGroups).map(([timeKey, days]) => {

    // Shorten days to 3 characters and join with "&"
    const formattedDays = days.map(d => d.slice(0, 3)).join(" & ");
    const [beginTime, endTime] = timeKey.split("-");

    // Format times
    const formattedBeginTime = formatTime(beginTime);
    const formattedEndTime = formatTime(endTime);

    return `${formattedDays} · ${formattedBeginTime} - ${formattedEndTime}`;
  });

  return formattedGroups.join(", ");
}


function formatTime(time: string) {
  // Convert 24-hour time e.g. "1400" to 12-hour time e.g. "2:00 PM"
  let hours = parseInt(time.slice(0, 2), 10);
  const minutes = time.slice(2);
  const suffix = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${suffix}`;
}