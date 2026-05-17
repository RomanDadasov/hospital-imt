using HospitalManagement.Data;
using HospitalManagement.Models;
using Microsoft.EntityFrameworkCore;

namespace HospitalManagement.Repositories
{
    public class PatientRepository : Repository<Patient>, IPatientRepository
    {
        public PatientRepository(AppDbContext context) : base(context) { }

        public async Task<IEnumerable<Patient>> GetAllActiveAsync()
        {
            return await _context.Patients
                .Include(p => p.Appointments)
                .Where(p => p.DeletedAt == null)
                .ToListAsync();
        }

        public async Task<Patient?> GetWithAppointmentsAsync(Guid id)
        {
            return await _context.Patients
                .Include(p => p.Appointments)
                    .ThenInclude(a => a.Doctor)
                        .ThenInclude(d => d.User)
                .FirstOrDefaultAsync(p => p.Id == id && p.DeletedAt == null);
        }

        public async Task<IEnumerable<Patient>> SearchAsync(string searchTerm)
        {
            return await _context.Patients
                .Where(p => p.DeletedAt == null &&
                    (p.FirstName.Contains(searchTerm) ||
                     p.LastName.Contains(searchTerm) ||
                     p.Email.Contains(searchTerm)))
                .ToListAsync();
        }
    }
}
