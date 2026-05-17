using HospitalManagement.Data;
using HospitalManagement.Models;
using Microsoft.EntityFrameworkCore;

namespace HospitalManagement.Repositories
{
    public class DoctorRepository : Repository<Doctor>, IDoctorRepository
    {
        public DoctorRepository(AppDbContext context) : base(context) { }

        public async Task<IEnumerable<Doctor>> GetAllActiveAsync()
        {
            return await _context.Doctors
                .Include(d => d.User)
                .Include(d => d.Department)
                .Where(d => d.DeletedAt == null) 
                .ToListAsync();
        }

        public async Task<Doctor?> GetWithDetailsAsync(Guid id)
        {
            return await _context.Doctors
                .Include(d => d.User)
                .Include(d => d.Department)
                .Include(d => d.Appointments)
                .FirstOrDefaultAsync(d => d.Id == id && d.DeletedAt == null);
        }

        public async Task<IEnumerable<Doctor>> GetByDepartmentAsync(Guid departmentId)
        {
            return await _context.Doctors
                .Include(d => d.User)
                .Include(d => d.Department)
                .Where(d => d.DepartmentId == departmentId && d.DeletedAt == null)
                .ToListAsync();
        }

        public async Task<Doctor?> GetByUserIdAsync(string userId)
        {
            return await _context.Doctors
                .Include(d => d.User)
                .Include(d => d.Department)
                .FirstOrDefaultAsync(d => d.UserId == userId && d.DeletedAt == null);
        }
    }
}
