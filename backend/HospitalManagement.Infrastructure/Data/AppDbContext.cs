using HospitalManagement.Domain.Models;
using HospitalManagement.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace HospitalManagement.Data
{
    public class AppDbContext : IdentityDbContext<ApplicationUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Doctor> Doctors => Set<Doctor>();
        public DbSet<Patient> Patients => Set<Patient>();
        public DbSet<Appointment> Appointments => Set<Appointment>();
        public DbSet<Department> Departments => Set<Department>();
        public DbSet<AppointmentAttachment> AppointmentAttachments => Set<AppointmentAttachment>();
        public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();

        public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
        public DbSet<AppointmentRequest> AppointmentRequests => Set<AppointmentRequest>();
        public DbSet<Payment> Payments => Set<Payment>();
        public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
        public DbSet<MedicalRecord> MedicalRecords => Set<MedicalRecord>();
        public DbSet<DoctorSchedule> DoctorSchedules => Set<DoctorSchedule>();
        public DbSet<Prescription> Prescriptions => Set<Prescription>();
        public DbSet<PrescriptionItem> PrescriptionItems => Set<PrescriptionItem>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Department
            modelBuilder.Entity<Department>(d =>
            {
                d.HasKey(d => d.Id);
                d.Property(d => d.Name).IsRequired().HasMaxLength(200);
                d.Property(d => d.Description).HasMaxLength(500);
            });

            // Doctor
            modelBuilder.Entity<Doctor>(d =>
            {
                d.HasKey(d => d.Id);
                d.Property(d => d.Specialization).IsRequired().HasMaxLength(200);
                d.Property(d => d.Phone).HasMaxLength(50);
                d.HasOne(d => d.User)
                    .WithMany()
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
                d.HasOne(d => d.Department)
                    .WithMany(dep => dep.Doctors)
                    .HasForeignKey(d => d.DepartmentId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Patient
            modelBuilder.Entity<Patient>(p =>
            {
                p.HasKey(p => p.Id);
                p.Property(p => p.FirstName).IsRequired().HasMaxLength(100);
                p.Property(p => p.LastName).IsRequired().HasMaxLength(100);
                p.Property(p => p.Email).IsRequired().HasMaxLength(200);
                p.Property(p => p.Phone).HasMaxLength(50);
                p.Property(p => p.Address).HasMaxLength(500);
            });

            // Appointment
            modelBuilder.Entity<Appointment>(a =>
            {
                a.HasKey(a => a.Id);
                a.Property(a => a.Status).IsRequired();
                a.Property(a => a.Notes).HasMaxLength(1000);
                a.HasOne(a => a.Doctor)
                    .WithMany(d => d.Appointments)
                    .HasForeignKey(a => a.DoctorId)
                    .OnDelete(DeleteBehavior.Restrict);
                a.HasOne(a => a.Patient)
                    .WithMany(p => p.Appointments)
                    .HasForeignKey(a => a.PatientId)
                    .OnDelete(DeleteBehavior.Restrict);
                a.HasOne(a => a.CreatedByUser)
                    .WithMany()
                    .HasForeignKey(a => a.CreatedByUserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // RefreshToken
            modelBuilder.Entity<RefreshToken>(rt =>
            {
                rt.HasKey(rt => rt.Id);
                rt.HasIndex(rt => rt.JwtId).IsUnique();
                rt.Property(rt => rt.JwtId).IsRequired().HasMaxLength(64);
                rt.Property(rt => rt.UserId).IsRequired().HasMaxLength(450);
            });

            modelBuilder.Entity<AppointmentAttachment>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.OriginalFileName).IsRequired().HasMaxLength(500);
                entity.Property(e => e.StoredFileName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.ContentType).IsRequired().HasMaxLength(200);
                entity.Property(e => e.UploadedByUserId).IsRequired().HasMaxLength(450);
                entity.HasOne(e => e.Appointment)
                    .WithMany(a => a.Attachments)
                    .HasForeignKey(e => e.AppointmentId)
                    .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.UploadedByUser)
                    .WithMany()
                    .HasForeignKey(e => e.UploadedByUserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<ChatMessage>(e =>
            {
                e.HasKey(e => e.Id);
                e.Property(e => e.RoomId).IsRequired().HasMaxLength(100);
                e.Property(e => e.Message).IsRequired().HasMaxLength(2000);
                e.Property(e => e.SenderId).IsRequired().HasMaxLength(450);
                e.HasOne(e => e.Sender)
                    .WithMany()
                    .HasForeignKey(e => e.SenderId)
                    .OnDelete(DeleteBehavior.Restrict);
                e.HasIndex(e => e.RoomId); 
            });

            modelBuilder.Entity<AuditLog>(a =>
            {
                a.HasKey(a => a.Id);
                a.Property(a => a.UserId).IsRequired().HasMaxLength(450);
                a.Property(a => a.UserFullName).IsRequired().HasMaxLength(200);
                a.Property(a => a.Action).IsRequired().HasMaxLength(50);
                a.Property(a => a.EntityType).IsRequired().HasMaxLength(100);
                a.Property(a => a.EntityId).HasMaxLength(450);
                a.Property(a => a.Details).HasMaxLength(1000);
                a.HasIndex(a => a.CreatedAt);
                a.HasIndex(a => a.UserId);
            });

            modelBuilder.Entity<MedicalRecord>(e =>
            {
                e.HasKey(x => x.Id);
                e.HasOne(x => x.Patient)
                .WithMany(p => p.MedicalRecords)
                .HasForeignKey(x => x.PatientId)
                .OnDelete(DeleteBehavior.Cascade);
                e.HasOne(x => x.Appointment).WithMany().HasForeignKey(x => x.AppointmentId).OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<DoctorSchedule>(e =>
            {
                e.HasKey(x => x.Id);
                e.HasOne(x => x.Doctor)
                 .WithMany(d => d.Schedules)
                 .HasForeignKey(x => x.DoctorId)
                 .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Prescription>(e =>
            {
                e.HasKey(x => x.Id);
                e.HasOne(x => x.Appointment)
                 .WithMany()
                 .HasForeignKey(x => x.AppointmentId)
                 .OnDelete(DeleteBehavior.Cascade);
                e.HasOne(x => x.Patient)
                 .WithMany()
                 .HasForeignKey(x => x.PatientId)
                 .OnDelete(DeleteBehavior.NoAction);
                e.Ignore(x => x.Items); 
            });

            modelBuilder.Entity<PrescriptionItem>(e =>
            {
                e.HasKey(x => x.Id);
                e.HasOne(x => x.Prescription)
                 .WithMany(p => p.Items)
                 .HasForeignKey(x => x.PrescriptionId)
                 .OnDelete(DeleteBehavior.Cascade);
            });

        }
    }
}
