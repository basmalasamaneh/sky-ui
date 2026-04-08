export async function POST(req) {
  try {
    const { firstName, lastName, email, password } = await req.json();

    // Validation (you might do this on backend too)
    if (!firstName || !lastName || !email || !password) {
      return Response.json(
        { status: 'error', message: 'جميع الحقول مطلوبة' },
        { status: 400 }
      );
    }

    // TODO: Add your backend logic here
    // - Hash password
    // - Check if user exists
    // - Save to database
    // - Generate JWT token

    // Example response:
    const token = 'your-jwt-token-here';
    
    return Response.json(
      {
        status: 'success',
        message: 'تم إنشاء الحساب بنجاح',
        data: {
          token,
          user: {
            id: 'generated-user-id',
            email,
            firstName,
            lastName,
            role: 'user'
          }
        }
      },
      { status: 201 }
    );
  } catch (error) {
    return Response.json(
      { status: 'error', message: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}
