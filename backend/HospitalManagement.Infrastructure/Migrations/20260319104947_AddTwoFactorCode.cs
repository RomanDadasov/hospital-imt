using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HospitalManagement.Migrations
{
    /// <inheritdoc />
    public partial class AddTwoFactorCode : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DoctorSchedules_Doctors_DoctorId1",
                table: "DoctorSchedules");

            migrationBuilder.DropIndex(
                name: "IX_DoctorSchedules_DoctorId1",
                table: "DoctorSchedules");

            migrationBuilder.DropColumn(
                name: "DoctorId1",
                table: "DoctorSchedules");

            migrationBuilder.AddColumn<string>(
                name: "TwoFactorCode",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "TwoFactorCodeExpiry",
                table: "AspNetUsers",
                type: "datetimeoffset",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TwoFactorCode",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "TwoFactorCodeExpiry",
                table: "AspNetUsers");

            migrationBuilder.AddColumn<Guid>(
                name: "DoctorId1",
                table: "DoctorSchedules",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_DoctorSchedules_DoctorId1",
                table: "DoctorSchedules",
                column: "DoctorId1");

            migrationBuilder.AddForeignKey(
                name: "FK_DoctorSchedules_Doctors_DoctorId1",
                table: "DoctorSchedules",
                column: "DoctorId1",
                principalTable: "Doctors",
                principalColumn: "Id");
        }
    }
}
