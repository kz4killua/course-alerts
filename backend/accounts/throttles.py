from rest_framework.throttling import AnonRateThrottle


class RequestEmailVerificationHourlyThrottle(AnonRateThrottle):
    rate = '10/hour'


class RequestEmailVerificationDailyThrottle(AnonRateThrottle):
    rate = '30/day'