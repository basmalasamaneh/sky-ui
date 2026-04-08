export async function POST(req) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, password, confirmPassword } = body;

    // 1. Basic Validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return Response.json(
        { status: 'error', message: 'جميع الحقول مطلوبة' },
        { status: 400 }
      );
    }

    // 2. Forward request to the actual backend server (Port 3001)
    try {
      const backendResponse = await fetch('http://localhost:3001/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          confirmPassword
        }),
      });

      const result = await backendResponse.json();

      if (!backendResponse.ok) {
        // Return structured errors from backend (e.g., validation or duplicate email)
        return Response.json(
          { 
            status: 'error', 
            message: result.message || 'فشل التحقق من البيانات',
            errors: result.errors 
          },
          { status: backendResponse.status }
        );
      }

      // Success - Map snake_case to camelCase for the frontend
      return Response.json({
        ...result,
        data: {
          ...result.data,
          user: {
            id: result.data.user.id,
            email: result.data.user.email,
            role: result.data.user.role,
            firstName: result.data.user.first_name,
            lastName: result.data.user.last_name,
          }
        }
      }, { status: 201 });

    } catch (fetchError) {
      console.error('Backend Connection Error:', fetchError);
      return Response.json(
        { 
          status: 'error', 
          message: 'لا يمكن الاتصال بسيرفر الباك آند. تأكد من تشغيل المشروع في مجلد stargate-register على المنفذ 3001.' 
        },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error('Signup Route Error:', error);
    return Response.json(
      { status: 'error', message: 'حدث خطأ غير متوقع في الخادم' },
      { status: 500 }
    );
  }
}
