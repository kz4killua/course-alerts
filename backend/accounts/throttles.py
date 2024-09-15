from rest_framework.throttling import UserRateThrottle, AnonRateThrottle


class RequestEmailVerificationHourlyThrottle(UserRateThrottle):
    rate = '5/hour'


class RequestEmailVerificationDailyThrottle(UserRateThrottle):
    rate = '10/day'