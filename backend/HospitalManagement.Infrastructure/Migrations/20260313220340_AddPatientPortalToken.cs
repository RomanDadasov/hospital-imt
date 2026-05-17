using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HospitalManagement.Migrations
{
    /// <inheritdoc />
    public partial class AddPatientPortalToken : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MedicalRecords_Patients_PatientId1",
                table: "MedicalRecords");

            migrationBuilder.DropIndex(
                name: "IX_MedicalRecords_PatientId1",
                table: "MedicalRecords");

            migrationBuilder.DropColumn(
                name: "PatientId1",
                table: "MedicalRecords");

            migrationBuilder.AddColumn<string>(
                name: "PortalToken",
                table: "Patients",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "PortalTokenExpiry",
                table: "Patients",
                type: "datetimeoffset",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PortalToken",
                table: "Patients");

            migrationBuilder.DropColumn(
                name: "PortalTokenExpiry",
                table: "Patients");

            migrationBuilder.AddColumn<Guid>(
                name: "PatientId1",
                table: "MedicalRecords",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_MedicalRecords_PatientId1",
                table: "MedicalRecords",
                column: "PatientId1");

            migrationBuilder.AddForeignKey(
                name: "FK_MedicalRecords_Patients_PatientId1",
                table: "MedicalRecords",
                column: "PatientId1",
                principalTable: "Patients",
                principalColumn: "Id");
        }
    }
}
