using HospitalManagement.Application.DTOs;

namespace HospitalManagement.Application.Services
{
    public interface IPatientPortalService
    {
        Task<string> GeneratePortalTokenAsync(Guid patientId);
        Task<PatientPortalDto?> GetPortalDataAsync(string token);
        Task<bool> PayAsync(string token, Guid appointmentId);
    }
}
