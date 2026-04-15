import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('http://localhost:8080/api/doctors', async ({ request }) => {
    const data = await request.json() as any;
    
    // Simulate validation error
    if (!data.firstName) {
      return HttpResponse.json(
        { errors: { firstName: "First name is required" }, status: 400 },
        { status: 400 }
      );
    }

    return HttpResponse.json(
      { ...data, id: 1 },
      { status: 201 }
    );
  }),

  // Add more API handlers as needed
];
