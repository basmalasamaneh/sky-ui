export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return Response.json(
        { status: 'error', message: 'البريد الإلكتروني وكلمة المرور مطلوبان' },
        { status: 400 }
      );
    }

    try {
      const backendResponse = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await backendResponse.json();

      if (!backendResponse.ok) {
        return Response.json(
          {
            status: 'error',
            message: result.message || 'فشل تسجيل الدخول',
            errors: result.errors,
          },
          { status: backendResponse.status }
        );
      }

      const backendUser = result.data?.user || {};

      return Response.json(
        {
          ...result,
          data: {
            ...result.data,
            user: {
              id: backendUser.id,
              email: backendUser.email,
              role: backendUser.role,
              firstName: backendUser.first_name || backendUser.firstName || '',
              lastName: backendUser.last_name || backendUser.lastName || '',
            },
          },
        },
        { status: 200 }
      );
    } catch (fetchError) {
      console.error('Backend Connection Error:', fetchError);
      return Response.json(
        {
          status: 'error',
          message: 'لا يمكن الاتصال بسيرفر الباك آند. تأكد من تشغيل المشروع في مجلد stargate-3 على المنفذ 3001.',
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Login Route Error:', error);
    return Response.json(
      { status: 'error', message: 'حدث خطأ غير متوقع في الخادم' },
      { status: 500 }
    );
  }
}
