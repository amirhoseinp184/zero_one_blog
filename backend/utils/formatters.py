from phonenumber_field.phonenumber import PhoneNumber

def format_phone(phone_number:PhoneNumber):
    return phone_number.as_national.replace(" ", "")