import random
import uuid

from django.db import transaction
from django.utils import timezone
from django.contrib.auth import get_user_model

from posts.models import Post


User = get_user_model()

# ---------------------------------------------------------
# Configuration
# ---------------------------------------------------------

NUMBER_OF_USERS = 20
POSTS_PER_USER = 10

# Every generated user will get this password.
# Change this for your development environment.
DEFAULT_PASSWORD = "TestPassword123!"

# ---------------------------------------------------------
# Sample data
# ---------------------------------------------------------

FIRST_NAMES = [
    "امیر",
    "محمد",
    "علی",
    "رضا",
    "حسین",
    "مهدی",
    "سجاد",
    "پارسا",
    "آرمان",
    "کیان",
    "نیما",
    "سامان",
    "نوید",
    "اشکان",
    "پرهام",
    "سینا",
    "یاسین",
    "محمدرضا",
    "اشکان",
    "بردیا",
]

LAST_NAMES = [
    "احمدی",
    "محمدی",
    "حسینی",
    "رضایی",
    "کریمی",
    "مرادی",
    "موسوی",
    "صادقی",
    "اکبری",
    "کاظمی",
    "جعفری",
    "رستمی",
    "نوری",
    "رحیمی",
    "حیدری",
    "امینی",
    "عباسی",
    "قاسمی",
    "سلطانی",
    "یوسفی",
]

TOPICS = [
    "پایتون",
    "جنگو",
    "برنامه‌نویسی وب",
    "هوش مصنوعی",
    "یادگیری ماشین",
    "توسعه نرم‌افزار",
    "مهندسی نرم‌افزار",
    "پایگاه داده",
    "طراحی API",
    "امنیت وب",
    "Docker",
    "Git",
    "توسعه بک‌اند",
    "توسعه فرانت‌اند",
    "معماری نرم‌افزار",
    "تست نرم‌افزار",
    "REST API",
    "PostgreSQL",
    "Redis",
    "ابزارهای توسعه",
]

TITLE_TEMPLATES = [
    "راهنمای جامع {topic} برای شروع حرفه‌ای",
    "چگونه {topic} را از صفر یاد بگیریم؟",
    "بهترین روش‌های یادگیری {topic}",
    "نکات مهم در کار با {topic}",
    "اشتباهات رایج هنگام یادگیری {topic}",
    "چرا {topic} برای توسعه نرم‌افزار مهم است؟",
    "تجربه من در یادگیری {topic}",
    "بررسی کامل {topic} برای برنامه‌نویسان",
    "مسیر یادگیری {topic} در سال ۲۰۲۶",
    "چگونه با {topic} پروژه واقعی بسازیم؟",
    "مقایسه ابزارهای مختلف در حوزه {topic}",
    "ترفندهای کاربردی برای کار با {topic}",
    "چالش‌های رایج در پروژه‌های {topic}",
    "از مبتدی تا حرفه‌ای در {topic}",
    "آینده {topic} و فرصت‌های شغلی آن",
]

INTRO_PARAGRAPHS = [
    "دنیای فناوری با سرعت زیادی در حال تغییر است و یادگیری مداوم به یکی از مهم‌ترین مهارت‌های یک برنامه‌نویس تبدیل شده است.",
    "در سال‌های اخیر استفاده از ابزارها و تکنولوژی‌های مدرن باعث شده توسعه نرم‌افزار سریع‌تر و ساده‌تر شود.",
    "برای بسیاری از برنامه‌نویسان، انتخاب مسیر درست برای یادگیری می‌تواند چالش‌برانگیز باشد.",
    "یکی از مهم‌ترین موضوعات در توسعه نرم‌افزار، داشتن درک درست از مفاهیم پایه و سپس حرکت به سمت مباحث پیشرفته است.",
]

BODY_PARAGRAPHS = [
    "در این مقاله تلاش می‌کنیم مفاهیم اصلی را به زبان ساده بررسی کنیم و نکاتی را مطرح کنیم که در پروژه‌های واقعی نیز کاربرد دارند.",
    "برای شروع بهتر است ابتدا مفاهیم بنیادی را یاد بگیرید و سپس با ساخت پروژه‌های کوچک دانش خود را تقویت کنید.",
    "یکی از روش‌های مؤثر برای یادگیری، مطالعه مستندات رسمی و سپس پیاده‌سازی یک پروژه واقعی است.",
    "در پروژه‌های واقعی معمولاً فقط دانستن syntax کافی نیست و باید بتوانید مشکلات را تحلیل و راه‌حل مناسب پیدا کنید.",
    "همچنین استفاده از Git، تست‌نویسی و رعایت اصول معماری مناسب می‌تواند کیفیت پروژه را به شکل قابل توجهی افزایش دهد.",
    "اگر قصد دارید در این زمینه حرفه‌ای شوید، پیشنهاد می‌شود به جای یادگیری پراکنده، یک مسیر مشخص و مرحله‌بندی‌شده داشته باشید.",
    "تمرین مداوم و بررسی پروژه‌های دیگران نیز یکی از بهترین راه‌ها برای عمیق‌تر شدن دانش فنی است.",
]

ENDING_PARAGRAPHS = [
    "در نهایت، مهم‌ترین عامل موفقیت در یادگیری استمرار و انجام تمرین‌های واقعی است.",
    "با داشتن یک برنامه منظم و انجام پروژه‌های کوچک می‌توانید این مسیر را با اعتمادبه‌نفس بیشتری ادامه دهید.",
    "تکنولوژی‌ها ممکن است در طول زمان تغییر کنند، اما اصول یادگیری، حل مسئله و طراحی درست نرم‌افزار همیشه ارزشمند باقی می‌مانند.",
    "بهتر است یادگیری را متوقف نکنید و همیشه بخشی از زمان خود را به بررسی تکنولوژی‌ها و روش‌های جدید اختصاص دهید.",
]

# ---------------------------------------------------------
# Helpers
# ---------------------------------------------------------


def generate_email(index):
    """
    Generates a unique email for development/testing.
    """
    return f"testuser_{index}_{uuid.uuid4().hex[:8]}@example.com"


def generate_username(index):
    """
    Generates a unique username.
    """
    return f"devuser_{index}_{uuid.uuid4().hex[:6]}"


def generate_post_content(topic):
    """
    Generates a Persian article-like body.
    """
    paragraphs = []

    paragraphs.append(random.choice(INTRO_PARAGRAPHS))

    # Add several body paragraphs
    selected_body = random.sample(
        BODY_PARAGRAPHS,
        k=random.randint(4, 6),
    )

    paragraphs.extend(
        paragraph.format(topic=topic)
        for paragraph in selected_body
    )

    paragraphs.append(random.choice(ENDING_PARAGRAPHS))

    return "\n\n".join(paragraphs)


def generate_title():
    topic = random.choice(TOPICS)
    template = random.choice(TITLE_TEMPLATES)

    return template.format(topic=topic)


# ---------------------------------------------------------
# Main seed logic
# ---------------------------------------------------------

@transaction.atomic
def create_sample_data():
    created_users = []
    created_posts = []

    for user_index in range(1, NUMBER_OF_USERS + 1):

        first_name = FIRST_NAMES[(user_index - 1) % len(FIRST_NAMES)]
        last_name = random.choice(LAST_NAMES)
        full_name = f"{first_name} {last_name}"

        email = generate_email(user_index)
        username = generate_username(user_index)

        # Create user
        user = User.objects.create_user(
            email=email,
            password=DEFAULT_PASSWORD,
            username=username,
            name=full_name,
            gender=random.choice(
                [
                    User.GenderChoices.MALE,
                    User.GenderChoices.FEMALE,
                    User.GenderChoices.OTHER,
                ]
            ),
            about_me=(
                f"من {full_name} هستم و به "
                f"برنامه‌نویسی، توسعه نرم‌افزار و تکنولوژی علاقه دارم."
            ),
            birthdate=None,
        )

        created_users.append(user)

        print(
            f"[USER {user_index}/{NUMBER_OF_USERS}] "
            f"Created: {user.name} | {user.email}"
        )

        # Create posts for this user
        for post_index in range(1, POSTS_PER_USER + 1):

            title = generate_title()
            topic = random.choice(TOPICS)

            # Make one or two posts drafts, most published
            if post_index <= 2:
                status = Post.Status.DRAFT
            else:
                status = Post.Status.PUBLISHED

            post = Post.objects.create(
                title=title,
                content=generate_post_content(topic),
                author=user,
                status=status,
            )

            created_posts.append(post)

            print(
                f"    └── Post {post_index}/{POSTS_PER_USER}: "
                f"{post.title} | {post.status} | "
                f"{post.reading_time_minutes} min"
            )

    print("\n========================================")
    print("Seed completed successfully!")
    print("========================================")
    print(f"Users created : {len(created_users)}")
    print(f"Posts created : {len(created_posts)}")
    print(f"Expected posts: {NUMBER_OF_USERS * POSTS_PER_USER}")
    print(f"Password      : {DEFAULT_PASSWORD}")
    print("========================================")

    return created_users, created_posts


# Run the seed
create_sample_data()