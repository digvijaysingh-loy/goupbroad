import { servicesAxiosInstance } from './config';

export const getAllStudents = async({page=1 , limit=10 , search})=>{
  return servicesAxiosInstance.get(`/chat/admin/students?page=${page}&limit=${limit}&search=${search}`);
}
export const getChatsAdmin = async({page =1 , search})=>{
  return servicesAxiosInstance.get(`/chat/admin/rooms?page=${page}&search=${search}`);
}
export const generateAdminToken = async(Data)=>{
  return servicesAxiosInstance.post(`/chat/admin/generate-token` ,Data);
}


export const getChatsStudents = async({page})=>{
  return servicesAxiosInstance.get(`/chat/student/rooms?page${page}`);
}
export const generateStudentToken = async({Data})=>{
  return servicesAxiosInstance.post(`/chat/student/generate-token` ,Data);
}
