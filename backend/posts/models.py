from django.db import models

from django.contrib.auth import get_user_model
from django.utils.text import slugify
from django.utils.crypto import get_random_string
from django.utils.html import strip_tags
from django.utils import timezone


User = get_user_model()


class Post(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"

    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, db_index=True)
    author = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="posts"
    )
    content = models.TextField()
    reading_time_minutes = models.PositiveBigIntegerField(default=0, editable=False)
    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.DRAFT
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):

        if not self.slug:
            self.slug = slugify(self.title) + "-" + get_random_string(length=6)

        if self.content:
            plain_text = strip_tags(self.content)
            word_count = len(plain_text.split())
            self.reading_time_minutes = max(1, word_count // 200)

        if self.status == self.Status.PUBLISHED and not self.published_at:
            self.published_at = timezone.now()    

        return super().save(*args, **kwargs)


