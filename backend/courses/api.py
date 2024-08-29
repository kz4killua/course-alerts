import re

import requests


BASE_URL = "https://ssp.mycampus.ca/StudentRegistrationSsb/ssb"
MEP_CODE = "UOIT"


def search_course_codes(query: str, term: str, offset: int = 1, limit: int = 10):
    """Search for courses by course code and description."""

    url = f"{BASE_URL}/classSearch/get_subjectcoursecombo"
    params = {
        "searchTerm": query,
        "term": term,
        "offset": offset,
        "max": limit,
        "mepCode": MEP_CODE,
    }
    response = requests.get(url, params=params)
    response.raise_for_status()
    return response.json()


def reset_data_form(jsessionid: str):
    """Reset the data form to start a new search."""

    cookies = {
        "JSESSIONID": jsessionid,
    }

    url = f"{BASE_URL}/classSearch/resetDataForm"
    response = requests.post(url, cookies=cookies)
    response.raise_for_status()


def get_sections(jsessionid: str, term: str, course_code: str = None, schedule_type: str = None, offset: int = 0, limit: int = 10):
    """Get a list of sections for a given course code."""

    reset_data_form(jsessionid)

    cookies = {
        "JSESSIONID": jsessionid,
    }
    
    url = f"{BASE_URL}/searchResults/searchResults"
    params = {
        "txt_subjectcoursecombo": course_code,
        "txt_term": term,
        "txt_scheduleType": schedule_type,
        "startDatepicker": "",
        "endDatepicker": "",
        "pageOffset": offset,
        "pageMaxSize": limit,
        "sortColumn": "subjectDescription",
        "sortDirection": "asc",
        "mepCode": MEP_CODE,
    }
    response = requests.get(url, params=params, cookies=cookies)
    response.raise_for_status()

    data = response.json()
    if data["data"] is None:
        raise ValueError("No sections found for the given term. Check the JSESSIONID.")

    return data


def get_linked_sections(term: str, course_reference_number: str):
    """Get linked sections for a given course reference number."""

    url = f"{BASE_URL}/searchResults/fetchLinkedSections"
    params = {
        "term": term,
        "courseReferenceNumber": course_reference_number,
        "mepCode": MEP_CODE,
    }
    response = requests.get(url, params=params)
    response.raise_for_status()

    return response.json()


def get_enrollment_info(term: str, course_reference_number: str):
    """Returns information regarding course availability."""

    url = f"{BASE_URL}/searchResults/getEnrollmentInfo"
    params = {
        "term": term,
        "courseReferenceNumber": course_reference_number,
        "mepCode": MEP_CODE,
    }
    response = requests.post(url, params=params)
    response.raise_for_status()

    # Parse response.text to get enrollment info
    patterns = {
        'enrollment': r'Enrollment Actual:</span>\s*<span[^>]*>\s*(\d+)',
        'maximumEnrollment': r'Enrollment Maximum:</span>\s*<span[^>]*>\s*(\d+)',
        'seatsAvailable': r'Enrollment Seats Available:</span>\s*<span[^>]*>\s*(\d+)',
        'waitCapacity': r'Waitlist Capacity:</span>\s*<span[^>]*>\s*(\d+)',
        'waitCount': r'Waitlist Actual:</span>\s*<span[^>]*>\s*(\d+)',
        'waitAvailable': r'Waitlist Seats Available:</span>\s*<span[^>]*>\s*(\d+)'
    }

    data = {}
    for key, pattern in patterns.items():
        match = re.search(pattern, response.text)
        if match:
            data[key] = int(match.group(1))
        else:
            data[key] = None

    return data