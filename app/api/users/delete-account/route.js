import { buildBackendApiUrl } from '@/lib/backend-api';

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
      const backendResponse = await fetch(buildBackendApiUrl('/api/v1/users/account'), {
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
        { status: 'error', message: 'تعذر حذف الحساب حالياً. حاول مرة أخرى لاحقاً.' },
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
