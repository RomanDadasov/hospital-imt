using HospitalManagement.Data;
using HospitalManagement.Models;
using Microsoft.EntityFrameworkCore;

namespace HospitalManagement.Repositories
{
    public class DepartmentRepository : Repository<Department>, IDepartmentRepository
    {
        public DepartmentRepository(AppDbContext context) : base(context) { }

        public async Task<IEnumerable<Department>> GetAllWithDoctorsAsync()
        {
            return await _context.Departments
                .Include(d => d.Doctors.Where(doc => doc.DeletedAt == null)) 
                .ToListAsync();
        }

        public async Task<Department?> GetWithDoctorsAsync(Guid id)
        {
            return await _context.Departments
                .Include(d => d.Doctors.Where(doc => doc.DeletedAt == null)) 
                .FirstOrDefaultAsync(d => d.Id == id);
        }
    }
}