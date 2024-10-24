from rest_framework.throttling import UserRateThrottle, AnonRateThrottle


class RequestEmailVerificationHourlyThrottle(UserRateThrottle):
    rate = '20/hour'


class RequestEmailVerificationDailyThrottle(UserRateThrottle):
    rate = '50/day'