from rest_framework.throttling import AnonRateThrottle


class RequestEmailVerificationHourlyThrottle(AnonRateThrottle):
    rate = '20/hour'