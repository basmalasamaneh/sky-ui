export async function PATCH(req) {
  try {
    const authHeader = req.headers.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json(
        { status: 'error', message: 'غير مصرح. يرجى تسجيل الدخول مجدداً.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { firstName, lastName } = body;

    if (!firstName || !lastName) {
      return Response.json(
        { status: 'error', message: 'الاسم الأول واسم العائلة مطلوبان' },
        { status: 400 }
      );
    }

    try {
      const backendResponse = await fetch('http://localhost:3001/api/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify({ firstName, lastName }),
      });

      const result = await backendResponse.json();

      if (!backendResponse.ok) {
        return Response.json(
          { status: 'error', message: result.message || 'فشل تحديث البيانات' },
          { status: backendResponse.status }
        );
      }

      const backendUser = result.data?.user || {};

      return Response.json({
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
      });
    } catch (fetchError) {
      console.error('Backend Connection Error:', fetchError);
      return Response.json(
        { status: 'error', message: 'لا يمكن الاتصال بسيرفر الباك آند. تأكد من تشغيل stargate-3 على المنفذ 3001.' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Update Profile Route Error:', error);
    return Response.json(
      { status: 'error', message: 'حدث خطأ غير متوقع في الخادم' },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const authHeader = req.headers.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json(
        { status: 'error', message: 'غير مصرح. يرجى تسجيل الدخول مجدداً.' },
        { status: 401 }
      );
    }

    try {
      const backendResponse = await fetch('http://localhost:3001/api/users/me', {
        method: 'DELETE',
        headers: {
          'Authorization': authHeader,
        },
      });

      const result = await backendResponse.json();

      if (!backendResponse.ok) {
        return Response.json(
          { status: 'error', message: result.message || 'فشل حذف الحساب' },
          { status: backendResponse.status }
        );
      }

      return Response.json(result, { status: 200 });
    } catch (fetchError) {
      console.error('Backend Connection Error:', fetchError);
      return Response.json(
        { status: 'error', message: 'لا يمكن الاتصال بسيرفر الباك آند. تأكد من تشغيل stargate-3 على المنفذ 3001.' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Delete Account Route Error:', error);
    return Response.json(
      { status: 'error', message: 'حدث خطأ غير متوقع في الخادم' },
      { status: 500 }
    );
  }
}
