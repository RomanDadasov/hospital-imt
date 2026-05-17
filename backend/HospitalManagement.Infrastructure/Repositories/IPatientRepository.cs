using HospitalManagement.Models;

namespace HospitalManagement.Repositories
{
    public interface IPatientRepository : IRepository<Patient>
    {
        Task<IEnumerable<Patient>> GetAllActiveAsync();
        Task<Patient?> GetWithAppointmentsAsync(Guid id);
        Task<IEnumerable<Patient>> SearchAsync(string searchTerm);
    }
}
