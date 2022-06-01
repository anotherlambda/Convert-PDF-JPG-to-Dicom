importPackage(Packages.org.dcm4che2.data);
var random = new java.util.Random();
var now = new java.util.Date();

//Set Scanned Document or Image Path 
var ScanDocDir = "C:/PDFtoDICOM/";
var OutDicomDir = "C:/PDFtoDICOM/Image/";

//Fetch data from json
var AccessionNumber=msg['order'][0]['accession_number'].toString();
var InstitutionName="Another Lambda";
var ReferringPhysicianName=msg['appointment']['referral_source_name'];
var StudyDescription=msg['order'][0]['exam_name'];
var SeriesDescription=msg['order'][0]['exam_code'];
var PatientID=msg['patient']['id'].toString();
var AdditionalPatientHistory="None";
var PatientComments="None";
var BodyPartExamined="N/A";
var StudyInstanceUID=msg['order'][0]['accession_number'].toString();
var SeriesInstanceUID=msg['order'][0]['accession_number'].toString();
var SeriesNumber=msg['order'][0]['accession_number'].toString();
var InstanceNumber=msg['order'][0]['episode_number'];
var AcquisitionNumber=msg['order'][0]['episode_number'];
var PatientName=msg['patient']['surname']+'^'+msg['patient']['firstname'];
var PatientBirthDate=DateUtil.convertDate('MM/dd/yyyy', 'yyyyMMdd', msg['patient']['Date_of_Birth']);
var PatientSex=msg['patient']['Gender'];
var PatientAge=msg['patient']['age'].toString();
var PatientAddress=msg['patient']['address'];


//Creating dicom from pdf, jpg,jpeg
if(msg['scans'].length>0)
{
for(var i = 0;i<msg['scans'].length;i++)
{
var ScanDoc = msg['scans'][i];
var ScanDocPath = ""+ScanDocDir+""+ScanDoc+"";
logger.info(ScanDocPath);
var ScanDocType = ScanDoc.split(".")[1].toUpperCase();
channelMap.put("ScanDocType",ScanDocType);

//Creating dicom from pdf
if(ScanDocType=="PDF")
{
if (new java.io.File(ScanDocPath).exists())
{
var tmp = "<dicom></dicom>";	
var PDF = FileUtil.readBytes(ScanDocPath);
var encPDF=FileUtil.encode(PDF);
var dicomBytes = FileUtil.decode(SerializerFactory.getSerializer('DICOM').fromXML(tmp));
var dcmObject = DICOMUtil.byteArrayToDicomObject(dicomBytes, false);

var UID_PREFIX = "9.5.6.0.1."; // get your own unique UID root to use here
var STUDY_SUB = "1.";
var SERIES_SUB = "2.";
var INSTANCE_SUB = "3.";    
var instanceUID = UID_PREFIX + INSTANCE_SUB + DateUtil.formatDate("yyyyMMddHHmmssSSS", new java.util.Date()) + "." + random.nextInt(100000);

dcmObject.putString(Tag.MediaStorageSOPInstanceUID, VR.UI, instanceUID);
dcmObject.putString(Tag.SOPInstanceUID, VR.UI, instanceUID);
dcmObject.putString(Tag.AccessionNumber, VR.SH, AccessionNumber);
dcmObject.putString(Tag.InstitutionName, VR.LO, InstitutionName);
dcmObject.putString(Tag.ReferringPhysicianName, VR.PN, ReferringPhysicianName);
dcmObject.putString(Tag.StudyDescription, VR.LO, StudyDescription);
dcmObject.putString(Tag.SeriesDescription, VR.LO, SeriesDescription);
dcmObject.putString(Tag.PatientID, VR.LO, PatientID);
dcmObject.putString(Tag.AdditionalPatientHistory, VR.LO, AdditionalPatientHistory);
dcmObject.putString(Tag.PatientComments, VR.LO, PatientComments);
dcmObject.putString(Tag.BodyPartExamined, VR.LO, BodyPartExamined);
dcmObject.putString(Tag.StudyInstanceUID, VR.UI, StudyInstanceUID);
dcmObject.putString(Tag.SeriesInstanceUID, VR.UI, SeriesInstanceUID);
dcmObject.putString(Tag.SeriesNumber, VR.IS, SeriesNumber);
dcmObject.putString(Tag.InstanceNumber, VR.IS, InstanceNumber);
dcmObject.putString(Tag.AcquisitionNumber, VR.IS, AcquisitionNumber);
dcmObject.putDate(Tag.InstanceCreationDate, VR.DA, now);
dcmObject.putDate(Tag.InstanceCreationTime, VR.TM, now);
dcmObject.putString(Tag.PatientName, VR.PN, PatientName);
dcmObject.putString(Tag.PatientBirthDate, VR.DA, PatientBirthDate);
dcmObject.putString(Tag.PatientSex, VR.CS, PatientSex);
dcmObject.putString(Tag.PatientAge, VR.IS, PatientAge);
dcmObject.putString(Tag.PatientAddress, VR.LO, PatientAddress);
dcmObject.putString(Tag.DocumentTitle , VR.LO, 'Doc_'+AccessionNumber);
dcmObject.putDate(Tag.StudyDate, VR.DA, now);
dcmObject.putDate(Tag.StudyTime, VR.TM, now);
dcmObject.putDate(Tag.SeriesDate, VR.DA, now);
dcmObject.putDate(Tag.SeriesTime, VR.TM, now);
dcmObject.putDate(Tag.ContentDate, VR.DA, now);
dcmObject.putDate(Tag.ContentTime, VR.TM, now);
dcmObject.putDate(Tag.ObservationDateTime , VR.DA, now);
dcmObject.putString(Tag.BurnedInAnnotation, VR.LO, "NO");
dcmObject.putBytes(Tag.EncapsulatedDocument, VR.OB, FileUtil.decode(encPDF));
dcmObject.putString(Tag.MIMETypeOfEncapsulatedDocument, VR.LO, "application/pdf");
dcmObject.putString(Tag.TransferSyntaxUID, VR.UI,"1.2.840.10008.1.2.1")
dcmObject.putString(Tag.MediaStorageSOPClassUID,VR.UI, "1.2.840.10008.5.1.4.1.1.104.1");
dcmObject.putString(Tag.ImplementationClassUID,VR.UI, "1.2.40.0.13.1.1");
dcmObject.putString(Tag.ImplementationVersionName,VR.SH, "dcm4che-2.0");
dcmObject.putString(Tag.SpecificCharacterSet,VR.CS, "ISO_IR 192");
dcmObject.putString(Tag.SOPClassUID,VR.UI, "1.2.840.10008.5.1.4.1.1.104.1");

tmp = SerializerFactory.getSerializer('DICOM').toXML(FileUtil.encode(DICOMUtil.dicomObjectToByteArray(dcmObject)));
var dcmByte = org.apache.commons.codec.binary.Base64.decodeBase64(SerializerFactory.getSerializer('DICOM').fromXML(tmp));
var dateString = Number(new Date()).toString();

//Write Dicom to Directory
org.apache.commons.io.FileUtils.writeByteArrayToFile(new java.io.File(''+OutDicomDir+''+'PDF_'+'PID'+PatientID+'_TS'+dateString+'_ACC'+AccessionNumber+'.dcm'),dcmByte,true);

	
	}
} 

//Creating Dicom from Image jpg/pgeg
else if(ScanDocType=="JPEG" || ScanDocType=="JPG")
{
if (new java.io.File(ScanDocPath).exists())
{
var tmp = "<dicom></dicom>";
//Image information
var Jpeg = FileUtil.readBytes(ScanDocPath);
var jpgSource  = new java.io.File(ScanDocPath);
var jpgLen = jpgSource.length();
var jpegImage = javax.imageio.ImageIO.read(new java.io.File(ScanDocPath));
var PixelData= jpegImage.getRaster().getDataBuffer().getData();
var colorComponents= jpegImage.getColorModel().getNumColorComponents();
var bitsPerPixel= jpegImage.getColorModel().getPixelSize();
var bitsAllocated= jpegImage.getColorModel().getPixelSize()/jpegImage.getColorModel().getNumColorComponents();
var samplesPerPixel= jpegImage.getColorModel().getNumColorComponents();   
var Rows= jpegImage.getHeight(); 
var Columns=jpegImage.getWidth();

var dicomBytes = FileUtil.decode(SerializerFactory.getSerializer('DICOM').fromXML(tmp));
var dcmObject = DICOMUtil.byteArrayToDicomObject(dicomBytes, false);

var UID_PREFIX = "9.5.6.0.1."; // get your own unique UID root to use here
var STUDY_SUB = "1.";
var SERIES_SUB = "2.";
var INSTANCE_SUB = "3.";    
var instanceUID = UID_PREFIX + INSTANCE_SUB + DateUtil.formatDate("yyyyMMddHHmmssSSS", new java.util.Date()) + "." + random.nextInt(100000);


dcmObject.putString(Tag.MediaStorageSOPInstanceUID, VR.UI, instanceUID);
dcmObject.putString(Tag.SOPInstanceUID, VR.UI, instanceUID);
dcmObject.putString(Tag.AccessionNumber, VR.SH, AccessionNumber);
dcmObject.putString(Tag.InstitutionName, VR.LO, InstitutionName);
dcmObject.putString(Tag.ReferringPhysicianName, VR.PN, ReferringPhysicianName);
dcmObject.putString(Tag.StudyDescription, VR.LO, StudyDescription);
dcmObject.putString(Tag.SeriesDescription, VR.LO, SeriesDescription);
dcmObject.putString(Tag.PatientID, VR.LO, PatientID);
dcmObject.putString(Tag.AdditionalPatientHistory, VR.LO, AdditionalPatientHistory);
dcmObject.putString(Tag.PatientComments, VR.LO, PatientComments);
dcmObject.putString(Tag.BodyPartExamined, VR.LO, BodyPartExamined);
dcmObject.putString(Tag.StudyInstanceUID, VR.UI, StudyInstanceUID);
dcmObject.putString(Tag.SeriesInstanceUID, VR.UI, SeriesInstanceUID);
dcmObject.putString(Tag.SeriesNumber, VR.IS, SeriesNumber);
dcmObject.putString(Tag.InstanceNumber, VR.IS, InstanceNumber);
dcmObject.putString(Tag.AcquisitionNumber, VR.IS, AcquisitionNumber);
dcmObject.putDate(Tag.InstanceCreationDate, VR.DA, now);
dcmObject.putDate(Tag.InstanceCreationTime, VR.TM, now);
dcmObject.putString(Tag.PatientName, VR.PN, PatientName);
dcmObject.putString(Tag.PatientBirthDate, VR.DA, PatientBirthDate);
dcmObject.putString(Tag.PatientSex, VR.CS, PatientSex);
dcmObject.putString(Tag.PatientAge, VR.IS, PatientAge);
dcmObject.putString(Tag.PatientAddress, VR.LO, PatientAddress);
dcmObject.putDate(Tag.StudyDate, VR.DA, now);
dcmObject.putDate(Tag.StudyTime, VR.TM, now);
dcmObject.putDate(Tag.SeriesDate, VR.DA, now);
dcmObject.putDate(Tag.SeriesTime, VR.TM, now);
dcmObject.putDate(Tag.ContentDate, VR.DA, now);
dcmObject.putDate(Tag.ContentTime, VR.TM, now);
dcmObject.putDate(Tag.ObservationDateTime , VR.DA, now);
dcmObject.putString(Tag.BurnedInAnnotation, VR.LO, "NO");
dcmObject.putBytes(Tag.PixelData, VR.OB, PixelData);
dcmObject.putInt(Tag.SamplesPerPixel, VR.US, samplesPerPixel);
dcmObject.putInt(Tag.Rows, VR.US, Rows);
dcmObject.putInt(Tag.Columns, VR.US, Columns);
dcmObject.putInt(Tag.BitsAllocated, VR.US, bitsAllocated);
dcmObject.putInt(Tag.BitsStored, VR.US, bitsAllocated);
dcmObject.putInt(Tag.HighBit, VR.US, (bitsAllocated -1));
dcmObject.putInt(Tag.PixelRepresentation, VR.US, 0);
dcmObject.putInt(Tag.PlanarConfiguration, VR.US, 0);
dcmObject.putString(Tag.SpecificCharacterSet, VR.CS, "ISO_IR 192");
dcmObject.putString(Tag.PhotometricInterpretation, VR.CS, "RGB");
dcmObject.putString(Tag.TransferSyntaxUID, VR.UI,"1.2.840.10008.1.2.1")
dcmObject.putString(Tag.MediaStorageSOPClassUID,VR.UI, "1.2.840.10008.5.1.4.1.1.7");
dcmObject.putString(Tag.ImplementationClassUID,VR.UI, "1.2.276.0.7230010.3.0.3.6.6");
dcmObject.putString(Tag.ImplementationVersionName,VR.SH, "OFFIS_DCMTK_366");
dcmObject.putString(Tag.SpecificCharacterSet,VR.CS, "ISO_IR 192");
dcmObject.putString(Tag.SOPClassUID,VR.UI, "1.2.840.10008.5.1.4.1.1.7");


tmp = SerializerFactory.getSerializer('DICOM').toXML(FileUtil.encode(DICOMUtil.dicomObjectToByteArray(dcmObject)));
var dcmByte = org.apache.commons.codec.binary.Base64.decodeBase64(SerializerFactory.getSerializer('DICOM').fromXML(tmp));
var dateString = Number(new Date()).toString();

//Write Dicom to Directory
org.apache.commons.io.FileUtils.writeByteArrayToFile(new java.io.File(''+OutDicomDir+''+'IMG_'+'PID'+PatientID+'_TS'+dateString+'_ACC'+AccessionNumber+'.dcm'),dcmByte,true);   
	}
	}
 }
}
