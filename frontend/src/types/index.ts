export interface Term {
  term: string;
  term_desc: string;
  registration_open: boolean;
}


export interface Course {
  subject: string;
  subject_description: string;
  subject_course: string;
  course_title: string;
  course_number: string;
}


export interface Section {
  id: string;
  course_reference_number: string;
  schedule_type_description: string;
  course: Course["subject_course"];
  term: Term["term"];
  meeting_times: MeetingTime[];
}


export interface MeetingTime {
  begin_time: string;
  end_time: string;
  start_date: string;
  end_date: string;
  days: string[];
}