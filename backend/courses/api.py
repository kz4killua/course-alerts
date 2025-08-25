import re

import aiohttp


BASE_URL = "https://ssp.mycampus.ca/StudentRegistrationSsb/ssb"
MEP_CODE = "UOIT"


async def search_course_codes(
    session: aiohttp.ClientSession,
    query: str,
    term: str,
    offset: int = 1,
    limit: int = 10,
) -> list:
    """Search for courses by course code and description."""

    url = f"{BASE_URL}/classSearch/get_subjectcoursecombo"
    params = {
        "searchTerm": query,
        "term": term,
        "offset": offset,
        "max": limit,
        "mepCode": MEP_CODE,
    }

    async with session.get(url, params=params) as response:
        response.raise_for_status()
        return await response.json()


async def reset_data_form(session: aiohttp.ClientSession, jsessionid: str):
    """Reset the data form to start a new search."""

    cookies = {
        "JSESSIONID": jsessionid,
    }
    url = f"{BASE_URL}/classSearch/resetDataForm"

    async with session.post(url, cookies=cookies) as response:
        response.raise_for_status()


async def get_sections(
    session: aiohttp.ClientSession,
    jsessionid: str,
    term: str,
    course_code: str = None,
    schedule_type: str = None,
    offset: int = 0,
    limit: int = 10,
) -> list:
    """Get a list of sections for a given course code."""

    await reset_data_form(session, jsessionid)

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
    params = clean_params(params)

    async with session.get(url, params=params, cookies=cookies) as response:
        response.raise_for_status()

        data = await response.json()
        if data["data"] is None:
            raise ValueError(
                f"No sections found for the term '{term}'. Check the JSESSIONID."
            )

        return data


async def get_linked_sections(
    session: aiohttp.ClientSession, term: str, course_reference_number: str
) -> dict:
    """Get linked sections for a given course reference number."""

    url = f"{BASE_URL}/searchResults/fetchLinkedSections"
    params = {
        "term": term,
        "courseReferenceNumber": course_reference_number,
        "mepCode": MEP_CODE,
    }

    async with session.get(url, params=params) as response:
        response.raise_for_status()
        return await response.json()


async def get_enrollment_info(
    session: aiohttp.ClientSession, term: str, course_reference_number: str
) -> dict:
    """Returns information regarding course availability."""

    url = f"{BASE_URL}/searchResults/getEnrollmentInfo"
    params = {
        "term": term,
        "courseReferenceNumber": course_reference_number,
        "mepCode": MEP_CODE,
    }

    async with session.post(url, params=params) as response:
        response.raise_for_status()

        # Parse the response text to get enrollment info
        text = await response.text()
        patterns = {
            "enrollment": r"Enrollment Actual:</span>\s*<span[^>]*>\s*(-?\d+)",
            "maximumEnrollment": r"Enrollment Maximum:</span>\s*<span[^>]*>\s*(-?\d+)",
            "seatsAvailable": r"Enrollment Seats Available:</span>\s*<span[^>]*>\s*(-?\d+)",
            "waitCapacity": r"Waitlist Capacity:</span>\s*<span[^>]*>\s*(-?\d+)",
            "waitCount": r"Waitlist Actual:</span>\s*<span[^>]*>\s*(-?\d+)",
            "waitAvailable": r"Waitlist Seats Available:</span>\s*<span[^>]*>\s*(-?\d+)",
        }

        data = {}
        for key, pattern in patterns.items():
            match = re.search(pattern, text)
            if match:
                data[key] = int(match.group(1))
            else:
                raise ValueError(
                    f"Unable to extract '{key}' from section with CRN '{course_reference_number}' in term '{term}'."
                )

        return data


def clean_params(params: dict) -> dict:
    """Remove query parameters with None values."""
    return {k: v for k, v in params.items() if v is not None}
