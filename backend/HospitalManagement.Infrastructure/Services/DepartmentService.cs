using AutoMapper;
using HospitalManagement.DTOs;
using HospitalManagement.Models;
using HospitalManagement.Repositories;

namespace HospitalManagement.Services
{
    public class DepartmentService : IDepartmentService
    {
        private readonly IDepartmentRepository _repository;
        private readonly IMapper _mapper;

        public DepartmentService(IDepartmentRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<DepartmentResponseDto>> GetAllAsync()
        {
            var departments = await _repository.GetAllWithDoctorsAsync();
            return _mapper.Map<IEnumerable<DepartmentResponseDto>>(departments);
        }

        public async Task<DepartmentResponseDto?> GetByIdAsync(Guid id)
        {
            var department = await _repository.GetWithDoctorsAsync(id);
            if (department is null) return null;
            return _mapper.Map<DepartmentResponseDto>(department);
        }

        public async Task<DepartmentResponseDto> CreateAsync(CreateDepartmentDto dto)
        {
            var department = _mapper.Map<Department>(dto);
            department.Id = Guid.NewGuid();
            await _repository.AddAsync(department);
            await _repository.SaveChangesAsync();
            return _mapper.Map<DepartmentResponseDto>(department);
        }

        public async Task<DepartmentResponseDto?> UpdateAsync(Guid id, UpdateDepartmentDto dto)
        {
            var department = await _repository.GetWithDoctorsAsync(id);
            if (department is null) return null;
            _mapper.Map(dto, department);
            await _repository.UpdateAsync(department);
            await _repository.SaveChangesAsync();
            return _mapper.Map<DepartmentResponseDto>(department);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var department = await _repository.GetWithDoctorsAsync(id);
            if (department is null) return false;
            if (department.Doctors.Any()) return false;
            await _repository.DeleteAsync(department);
            await _repository.SaveChangesAsync();
            return true;
        }
    }
}
