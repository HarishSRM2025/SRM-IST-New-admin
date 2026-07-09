const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
export const UPLOADS_BASE_URL = API_BASE_URL.replace(/\/api$/, '');

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}/careers${path}`, {
    headers: options.body instanceof FormData ? undefined : { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Careers request failed.');
  }

  return data;
};

export const getCareers = () => request('/get-careers');

export const createCareer = (career) => request('/add-career', {
  method: 'POST',
  body: JSON.stringify(career),
});

export const updateCareer = (id, career) => request(`/update-career/${id}`, {
  method: 'PUT',
  body: JSON.stringify(career),
});

export const deleteCareer = (id) => request(`/delete-career/${id}`, {
  method: 'DELETE',
});

export const getJobApplications = () => request('/get-job-applications');

export const deleteJobApplication = (id) => request(`/delete-job-application/${id}`, {
  method: 'DELETE',
});

export const getResumeUrl = (resume) => {
  if (!resume) return '';
  if (/^https?:\/\//i.test(resume)) return resume;
  const fileName = resume.split(/[\\/]/).pop();
  return `${UPLOADS_BASE_URL}/public/uploads/${fileName}`;
};
