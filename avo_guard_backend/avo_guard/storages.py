from storages.backends.s3boto3 import S3Boto3Storage


class StaticStorage(S3Boto3Storage):
    location = "staticfiles"
    file_overwrite = True


class MediaStorage(S3Boto3Storage):
    location = "mediafiles"
    file_overwrite = False