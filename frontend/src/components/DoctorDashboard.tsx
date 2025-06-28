import { useState, useEffect } from 'react';
import { useDarkMode } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useNavigate } from 'react-router-dom';
import { generatePrescriptionPDF } from '../utils/pdfGenerator';
import Layout from './Layout';

interface Patient {
  id: string;
  name: string;
  age: number;
  email: string;
  diagnosis: string;
  history: string[];
  selectedDoctor: string;
}

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [symptoms, setSymptoms] = useState('');
  const [prescription, setPrescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [doctorId, setDoctorId] = useState<string>('');
  const [showPast, setShowPast] = useState(false);
  const [pastAppointments, setPastAppointments] = useState<any[]>([]);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<any | null>(null);

  useEffect(() => {
    const userType = localStorage.getItem('userType');
    const currentDoctorId = localStorage.getItem('doctorId');
    
    if (userType !== 'doctor' || !currentDoctorId) {
      navigate('/login');
      return;
    }

    setDoctorId(currentDoctorId);
    loadPatients(currentDoctorId);
  }, [navigate]);

  const loadPatients = async (doctorId: string) => {
    try {
      const response = await fetch(`/api/doctor-patients/${doctorId}`);
      if (response.ok) {
        const data = await response.json();
        setPatients(data);
      }
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

  const loadPastAppointments = async (doctorId: string) => {
    try {
      const response = await fetch(`/api/doctor-past-appointments/${doctorId}`);
      if (response.ok) {
        const data = await response.json();
        setPastAppointments(data);
      }
    } catch (error) {
      console.error('Error loading past appointments:', error);
    }
  };

  const handleGeneratePrescription = async () => {
    if (!selectedPatient || !symptoms) {
      alert('Please select a patient and enter symptoms');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/generate_prescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: selectedPatient.id,
          symptoms,
          doctor_id: doctorId
        }),
      });

      const data = await response.json();
      setPrescription(data.prescription);
    } catch (error) {
      console.error('Error generating prescription:', error);
      alert('Error generating prescription');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrescription = async () => {
    if (!selectedPatient || !prescription) {
      alert('Please select a patient and generate a prescription');
      return;
    }

    try {
      const response = await fetch('/api/save_prescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: selectedPatient.id,
          symptoms,
          prescription,
          doctor_id: doctorId
        }),
      });

      if (response.ok) {
        await fetch(`/api/patients`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...selectedPatient, selectedDoctor: '' })
        });
        alert('Prescription saved successfully!');
        setPrescription('');
        setSymptoms('');
        setSelectedPatient(null);
        loadPatients(doctorId);
      } else {
        alert('Error saving prescription');
      }
    } catch (error) {
      console.error('Error saving prescription:', error);
      alert('Error saving prescription');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userType');
    localStorage.removeItem('doctorId');
    navigate('/login');
  };

  const getDoctorName = (doctorId: string) => {
    const doctors = {
      'doctor1': 'Dr. Smith - Cardiologist',
      'doctor2': 'Dr. Johnson - General Physician'
    };
    return doctors[doctorId as keyof typeof doctors] || 'Unknown Doctor';
  };

  const handleDownloadPDF = () => {
    if (!selectedPatient || !prescription) {
      alert('Please select a patient and generate a prescription first');
      return;
    }

    const prescriptionData = {
      id: `temp-${Date.now()}`,
      patient_name: selectedPatient.name,
      doctor_name: getDoctorName(doctorId),
      age: selectedPatient.age,
      history: selectedPatient.history,
      diagnosis: selectedPatient.diagnosis,
      symptoms,
      prescription,
      timestamp: new Date().toISOString()
    };

    generatePrescriptionPDF(prescriptionData);
  };

  const showPrescription = (prescription: any) => {
    setSelectedPrescription(prescription);
    setShowPrescriptionModal(true);
  };

  const closePrescriptionModal = () => {
    setShowPrescriptionModal(false);
    setSelectedPrescription(null);
  };

  return (
    <Layout title="Doctor Dashboard">
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className={`text-2xl sm:text-3xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Doctor Dashboard</h1>
            <p className={`text-sm sm:text-base mt-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>{getDoctorName(doctorId)}</p>
          </div>
          <Button 
            onClick={handleLogout} 
            variant="outline" 
            className={`w-full sm:w-auto ${
              isDarkMode 
                ? 'text-white border-gray-600 hover:bg-gray-700 hover:text-white' 
                : ''
            }`}
          >
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Patients Section */}
          <Card className={`p-4 sm:p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
            isDarkMode 
              ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800/60' 
              : 'bg-white/50 border-gray-200 hover:bg-white/70'
          }`}>
            <h2 className={`text-xl sm:text-2xl font-semibold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>My Patients</h2>
            {patients.length === 0 ? (
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>No patients assigned yet.</p>
            ) : (
              <div className="space-y-2">
                {patients.map((patient) => (
                  <Card
                    key={patient.id}
                    className={`flex flex-row items-center justify-between p-2 cursor-pointer transition-all duration-150 text-sm sm:text-base ${
                      selectedPatient?.id === patient.id
                        ? isDarkMode 
                          ? 'border-blue-400 bg-blue-900/15' 
                          : 'border-blue-500 bg-blue-50'
                        : isDarkMode 
                          ? 'hover:bg-gray-800/10 border-gray-600' 
                          : 'hover:bg-gray-50/30 border-gray-200'
                    }`}
                    onClick={() => setSelectedPatient(patient)}
                  >
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 w-full items-start sm:items-center">
                      <span className={`font-semibold min-w-[120px] ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>{patient.name}</span>
                      <span className={`min-w-[60px] ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>Age: {patient.age}</span>
                      <span className={`min-w-[160px] ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>Diagnosis: {patient.diagnosis}</span>
                      <span className={`flex-1 truncate ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>History: {patient.history.join(', ')}</span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>

          {/* Prescription Section */}
          <Card className={`p-4 sm:p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
            isDarkMode 
              ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800/60' 
              : 'bg-white/50 border-gray-200 hover:bg-white/70'
          }`}>
            <h2 className={`text-xl sm:text-2xl font-semibold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Generate Prescription</h2>
            
            {selectedPatient && (
              <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg ${
                isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'
              }`}>
                <h3 className={`font-semibold mb-2 text-sm sm:text-base ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Selected Patient</h3>
                <p className={`text-sm sm:text-base ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}><strong>Name:</strong> {selectedPatient.name}</p>
                <p className={`text-sm sm:text-base ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}><strong>Age:</strong> {selectedPatient.age}</p>
                <p className={`text-sm sm:text-base ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}><strong>Diagnosis:</strong> {selectedPatient.diagnosis}</p>
                <p className={`text-sm sm:text-base ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}><strong>History:</strong> {selectedPatient.history.join(', ')}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="symptoms">Current Symptoms</Label>
                <Textarea
                  id="symptoms"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Enter patient's current symptoms..."
                  className="mt-1"
                />
              </div>

              <Button
                onClick={handleGeneratePrescription}
                disabled={!selectedPatient || !symptoms || loading}
                className="w-full"
              >
                {loading ? 'Generating...' : 'Generate Prescription'}
              </Button>

              {prescription && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="prescription">Generated Prescription</Label>
                    <Textarea
                      id="prescription"
                      value={prescription}
                      onChange={(e) => setPrescription(e.target.value)}
                      placeholder="Generated prescription will appear here..."
                      className="mt-1"
                      rows={6}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <Button
                      onClick={handleSavePrescription}
                      className="flex-1"
                      variant="default"
                    >
                      Save Prescription
                    </Button>
                    <Button
                      onClick={handleDownloadPDF}
                      variant="outline"
                    >
                      Download PDF
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        <Button 
          onClick={() => { setShowPast(!showPast); if (!showPast) loadPastAppointments(doctorId); }} 
          variant="outline" 
          className={`mt-6 sm:mt-8 ml-0 sm:ml-4 w-full sm:w-auto ${
            isDarkMode 
              ? 'text-white border-gray-600 hover:bg-gray-700 hover:text-white' 
              : ''
          }`}
        >
          {showPast ? 'Hide Past Appointments' : 'Show Past Appointments'}
        </Button>

        {showPast && (
          <Card className={`p-3 sm:p-4 mt-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
            isDarkMode 
              ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800/60' 
              : 'bg-white/50 border-gray-200 hover:bg-white/70'
          }`}>
            <h2 className={`text-lg sm:text-xl font-semibold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Past Appointments</h2>
            {pastAppointments.length === 0 ? (
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>No past appointments.</p>
            ) : (
              <div className="space-y-2">
                {pastAppointments.map((appt) => (
                  <div key={appt.id} className={`flex flex-col sm:flex-row gap-2 sm:gap-6 items-start sm:items-center text-sm sm:text-base p-2 border-b transition-all duration-150 ${
                    isDarkMode 
                      ? 'border-gray-700 text-white hover:bg-gray-800/8' 
                      : 'border-gray-200 text-gray-900 hover:bg-gray-50/20'
                  }`}>
                    <span className={`font-semibold min-w-[120px] ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{appt.patient_name}</span>
                    <span className={`min-w-[60px] ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>Age: {appt.age}</span>
                    <span className={`min-w-[160px] ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>Diagnosis: {appt.diagnosis}</span>
                    <span className={`flex-1 truncate ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>History: {appt.history.join(', ')}</span>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => showPrescription(appt)}
                      className={`w-full sm:w-auto ${
                        isDarkMode 
                          ? 'text-white border-gray-600 hover:bg-gray-700 hover:text-white' 
                          : ''
                      }`}
                    >
                      Show Prescription
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Custom Prescription Modal */}
        {showPrescriptionModal && selectedPrescription && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Transparent overlay */}
            <div className="absolute inset-0 bg-transparent" onClick={closePrescriptionModal}></div>
            
            {/* Centered modal container */}
            <div className={`relative rounded-lg border shadow-xl p-4 sm:p-6 w-full max-w-sm sm:max-w-2xl max-h-[90vh] overflow-y-auto transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-600' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg sm:text-xl font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Prescription for {selectedPrescription.patient_name}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closePrescriptionModal}
                  className={isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}
                >
                  ✕
                </Button>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <div className={`p-3 sm:p-4 rounded-lg ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <h4 className={`font-medium mb-2 text-sm sm:text-base ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Patient Information:</h4>
                  <p className={`text-sm sm:text-base ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}><strong>Name:</strong> {selectedPrescription.patient_name}</p>
                  <p className={`text-sm sm:text-base ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}><strong>Age:</strong> {selectedPrescription.age}</p>
                  <p className={`text-sm sm:text-base ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}><strong>Diagnosis:</strong> {selectedPrescription.diagnosis}</p>
                  <p className={`text-sm sm:text-base ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}><strong>History:</strong> {selectedPrescription.history?.join(', ') || 'None'}</p>
                </div>
                
                <div className={`p-3 sm:p-4 rounded-lg ${
                  isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-50'
                }`}>
                  <h4 className={`font-medium mb-2 text-sm sm:text-base ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Symptoms:</h4>
                  <p className={`text-sm sm:text-base ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>{selectedPrescription.symptoms}</p>
                </div>
                
                <div className={`p-3 sm:p-4 rounded-lg ${
                  isDarkMode ? 'bg-blue-900/50' : 'bg-blue-50'
                }`}>
                  <h4 className={`font-medium mb-2 text-sm sm:text-base ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Prescription:</h4>
                  <div className={`whitespace-pre-line text-sm sm:text-base ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {selectedPrescription.prescription}
                  </div>
                </div>
                
                <div className={`text-xs sm:text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Date: {new Date(selectedPrescription.timestamp).toLocaleDateString()}
                </div>
              </div>
              
              <div className="flex justify-end mt-4 sm:mt-6">
                <Button 
                  onClick={() => generatePrescriptionPDF({
                    id: selectedPrescription.id,
                    patient_name: selectedPrescription.patient_name,
                    doctor_name: selectedPrescription.doctor_name,
                    age: selectedPrescription.age || 0,
                    history: selectedPrescription.history || [],
                    diagnosis: selectedPrescription.diagnosis || '',
                    symptoms: selectedPrescription.symptoms || '',
                    prescription: selectedPrescription.prescription,
                    timestamp: selectedPrescription.timestamp
                  })}
                  className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                >
                  Download PDF
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 