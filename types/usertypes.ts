export enum UserRole {
  HeadOfficer = "HO", // Head Office
  DistrictOfficer = "DO", // District Office
  Contractor = "CO", // Contractor
  Employee = "EM", // Employee
  TPI = "TPI", // Third-Party Inspector
  TPI_STAFF = "TPI_STAFF", // TPI Staff
  ExecutiveEngineer = "EE", // Executive Engineer
  DOStaff = "DO_STAFF", // DO Staff
}

export enum WorkItemComponentStatus {
  PENDING = "PENDING",
  SUBMITTED = "SUBMITTED",
  IN_PROGRESS = "IN_PROGRESS",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum WorkOrderType {
  SVS = "SVS",
  BULK_VILLAGE = "BULK_VILLAGE",
}

export enum TpiReferencePhotoStatusEnum {
  UPLOADED = "UPLOADED",
  SELECTED = "SELECTED",
}

