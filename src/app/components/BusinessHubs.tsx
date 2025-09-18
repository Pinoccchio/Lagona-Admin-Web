'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { businessHubService } from '@/services/businessHubService';
import { loadingStationService } from '@/services/loadingStationService';
import { systemConfigService } from '@/services/systemConfigService';
import AuditHistory from './AuditHistory';
import MapVisualization from './MapVisualization';
import LocationDetailsModal from './LocationDetailsModal';
import { extractLegacyLocationData } from '@/utils/location';
import type { Database } from '@/lib/supabase/types';

type BusinessHub = Database['public']['Tables']['business_hubs']['Row'] & {
  loadingStationsCount?: number;
  users?: {
    email: string | null;
    phone_number: string | null;
    full_name: string | null;
    status: string | null;
  } | null;
  // Legacy fields for backward compatibility
  region?: string | null;
  hierarchical_address?: string | null;
  coordinates?: { lat: number; lng: number } | null;
};

type FormData = {
  name: string;
  municipality: string;
  province: string;
  manager_name: string;
  territory_name: string;
  phone_number: string;
  initial_load: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function BusinessHubs() {
  const [showModal, setShowModal] = useState(false);
  const [selectedHub, setSelectedHub] = useState<BusinessHub | null>(null);
  const [businessHubs, setBusinessHubs] = useState<BusinessHub[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditEntityId, setAuditEntityId] = useState<string | null>(null);
  const [auditEntityName, setAuditEntityName] = useState<string | null>(null);

  // Location modal states
  const [showMapVisualization, setShowMapVisualization] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedHubForLocation, setSelectedHubForLocation] = useState<BusinessHub | null>(null);
  
  // State for dropdown actions menu
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{[key: string]: 'up' | 'down'}>({});
  const [dropdownCoords, setDropdownCoords] = useState<{[key: string]: {top: number, left: number, right?: number}}>({});
  const [selectedHubForDropdown, setSelectedHubForDropdown] = useState<BusinessHub | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    municipality: '',
    province: '',
    manager_name: '',
    territory_name: '',
    phone_number: '',
    initial_load: '0',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [hubToDelete, setHubToDelete] = useState<BusinessHub | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteConfirmationName, setDeleteConfirmationName] = useState('');
  
  // Top-up modal states
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [selectedHubForTopUp, setSelectedHubForTopUp] = useState<BusinessHub | null>(null);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [topUpError, setTopUpError] = useState<string | null>(null);
  const [topUpSuccess, setTopUpSuccess] = useState<string | null>(null);
  
  // System config for dynamic bonus rates
  const [businessHubBonusRate, setBusinessHubBonusRate] = useState<number>(50); // Default fallback

  // Enhanced filtering states
  const [locationValidationFilter, setLocationValidationFilter] = useState<string>('all');
  const [locationAccuracyFilter, setLocationAccuracyFilter] = useState<string>('all');
  const [plusCodeFilter, setPlusCodeFilter] = useState<string>('all');

  // Status change templates
  const statusTemplates = {
    pending: [
      'Initial registration - awaiting document review',
      'Additional documentation required',
      'Pending verification of business credentials',
      'Awaiting admin review and approval'
    ],
    active: [
      'All requirements met - account activated',
      'Payment received - account reactivated', 
      'Investigation resolved - account restored',
      'Documents approved - welcome to LAGONA',
      'Manual activation by admin',
      'Account restored after suspension review'
    ],
    inactive: [
      'Account deactivated per user request',
      'Business closure - voluntary deactivation',
      'Extended inactivity - account suspended',
      'Failed to meet operational requirements',
      'Administrative deactivation'
    ],
    suspended: [
      'Payment overdue - account suspended until payment',
      'Customer complaints received - under investigation',
      'Policy violation - temporary suspension',
      'Document verification issues - suspended pending review',
      'Quality concerns - suspended for evaluation',
      'Temporary suspension for system maintenance'
    ]
  };

  // View Stations modal states
  const [showViewStationsModal, setShowViewStationsModal] = useState(false);
  const [selectedHubForStations, setSelectedHubForStations] = useState<BusinessHub | null>(null);
  const [loadingStationsData, setLoadingStationsData] = useState<any[]>([]);
  const [stationsLoading, setStationsLoading] = useState(false);
  const [stationsError, setStationsError] = useState<string | null>(null);
  
  // Status management modal states
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedHubForStatus, setSelectedHubForStatus] = useState<BusinessHub | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusChangeReason, setStatusChangeReason] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [notesAction, setNotesAction] = useState<'replace' | 'append'>('append');
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [statusSuccess, setStatusSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchBusinessHubs();
    fetchStatistics();
    loadSystemBonusRates();
  }, []);

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown && !(event.target as Element)?.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  const loadSystemBonusRates = async () => {
    try {
      const bonusRates = await systemConfigService.getTopUpBonuses();
      setBusinessHubBonusRate(bonusRates.businessHubBonus);
    } catch (error) {
      console.error('Error loading system bonus rates:', error);
      // Keep default value if loading fails
    }
  };

  const fetchBusinessHubs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[BusinessHubs] Starting to fetch business hubs...');
      
      const hubs = await businessHubService.getAllBusinessHubs();
      console.log('[BusinessHubs] Fetched hubs:', hubs?.length || 0);
      
      if (!hubs || hubs.length === 0) {
        console.log('[BusinessHubs] No hubs returned');
        setBusinessHubs([]);
        return;
      }
      
      // Fetch loading stations count for each hub
      const hubsWithStations = await Promise.all(
        hubs.map(async (hub) => {
          try {
            const stations = await loadingStationService.getLoadingStationsByBusinessHub(hub.id);
            return {
              ...hub,
              loadingStationsCount: stations.length
            };
          } catch (stationError) {
            console.warn(`[BusinessHubs] Failed to fetch stations for hub ${hub.id}:`, stationError);
            return {
              ...hub,
              loadingStationsCount: 0
            };
          }
        })
      );
      
      console.log('[BusinessHubs] Final hubs with stations:', hubsWithStations.length);
      setBusinessHubs(hubsWithStations);

      // Clean up selectedHubForLocation if the hub no longer exists
      if (selectedHubForLocation && !hubsWithStations.find(h => h.id === selectedHubForLocation.id)) {
        setSelectedHubForLocation(null);
      }
    } catch (err) {
      console.error('[BusinessHubs] Error fetching business hubs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load business hubs');
    } finally {
      setLoading(false);
    }
  }, [selectedHubForLocation]);

  const fetchStatistics = async () => {
    try {
      const stats = await businessHubService.getBusinessHubStatistics();
      setStatistics(stats);
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  // Enhanced filtering logic
  const displayHubs = businessHubs.filter(hub => {
    // Extract location data using utility functions
    const locationInfo = extractLegacyLocationData(hub);

    // Location validation filter
    if (locationValidationFilter !== 'all') {
      if (locationValidationFilter === 'none' && locationInfo.location_validation_status) return false;
      if (locationValidationFilter !== 'none' && locationInfo.location_validation_status !== locationValidationFilter) return false;
    }

    // Location accuracy filter
    if (locationAccuracyFilter !== 'all') {
      if (locationAccuracyFilter === 'high' && (!locationInfo.location_accuracy_meters || locationInfo.location_accuracy_meters > 10)) return false;
      if (locationAccuracyFilter === 'medium' && (!locationInfo.location_accuracy_meters || locationInfo.location_accuracy_meters <= 10 || locationInfo.location_accuracy_meters > 50)) return false;
      if (locationAccuracyFilter === 'low' && (!locationInfo.location_accuracy_meters || locationInfo.location_accuracy_meters <= 50)) return false;
      if (locationAccuracyFilter === 'none' && locationInfo.location_accuracy_meters) return false;
    }

    // Plus code filter
    if (plusCodeFilter !== 'all') {
      if (plusCodeFilter === 'has' && !locationInfo.plus_code) return false;
      if (plusCodeFilter === 'missing' && locationInfo.plus_code) return false;
    }

    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-red-600 bg-red-100';
      case 'suspended': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleCreate = () => {
    setSelectedHub(null);
    setFormData({
      name: '',
      municipality: '',
      province: '',
      manager_name: '',
      territory_name: '',
      phone_number: '',
      initial_load: '0',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setFormError(null);
    setSuccessMessage(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowModal(true);
  };

  const handleEdit = async (hub: BusinessHub) => {
    setSelectedHub(hub);
    
    setFormData({
      name: hub.name,
      municipality: hub.municipality,
      province: hub.province,
      manager_name: hub.manager_name || '',
      territory_name: hub.territory_name || '',
      phone_number: hub.users?.phone_number || '',
      initial_load: (hub.initial_balance || 0).toString(),
      email: '',
      password: '',
      confirmPassword: ''
    });
    setFormError(null);
    setSuccessMessage(null);
    setShowModal(true);
  };

  // Philippine phone number auto-formatting function
  const formatPhoneNumber = (input: string): string => {
    // Remove all non-digit characters
    const numbers = input.replace(/\D/g, '');
    
    // Handle different Philippine number formats and convert to +639XXXXXXXXX
    if (numbers.length >= 10) {
      // Handle 09XXXXXXXXX format (11 digits)
      if (numbers.startsWith('09') && numbers.length === 11) {
        return '+63' + numbers.slice(1); // Remove 0, add +63
      }
      // Handle 9XXXXXXXXX format (10 digits)
      else if (numbers.startsWith('9') && numbers.length === 10) {
        return '+63' + numbers; // Add +63 prefix
      }
      // Handle 639XXXXXXXXX format (12 digits)
      else if (numbers.startsWith('639') && numbers.length === 12) {
        return '+' + numbers; // Add + prefix
      }
      // Handle +639XXXXXXXXX format (already correct, but clean up)
      else if (numbers.startsWith('639') && numbers.length === 12) {
        return '+' + numbers;
      }
    }
    
    // For incomplete numbers or other formats, return the cleaned input
    return input.startsWith('+63') ? input : (numbers.startsWith('639') ? '+' + numbers : (numbers.length > 0 ? '+63' + numbers : ''));
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    // Auto-format phone number for Philippine format
    if (field === 'phone_number') {
      value = formatPhoneNumber(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (formError) setFormError(null);
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return 'Hub name is required';
    if (!formData.municipality.trim()) return 'Municipality is required';
    if (!formData.province.trim()) return 'Province is required';
    if (!formData.manager_name.trim()) return 'Manager name is required';
    
    // Phone number validation (required) - Philippine format
    if (!formData.phone_number.trim()) return 'Phone number is required';
    
    // Remove all non-digit characters except +
    const cleanNumber = formData.phone_number.replace(/[^\d+]/g, '');
    
    // Philippine mobile number validation (matching Flutter validators)
    const isValidPhilippineNumber = 
      // Format 1: +639XXXXXXXXX (13 characters with +)
      (cleanNumber.startsWith('+639') && cleanNumber.length === 13 && cleanNumber.charAt(3) === '9') ||
      // Format 2: 639XXXXXXXXX (12 characters without +)  
      (cleanNumber.startsWith('639') && cleanNumber.length === 12 && cleanNumber.charAt(2) === '9') ||
      // Format 3: 09XXXXXXXXX (11 characters local format)
      (cleanNumber.startsWith('09') && cleanNumber.length === 11 && cleanNumber.charAt(1) === '9') ||
      // Format 4: 9XXXXXXXXX (10 characters without prefix)
      (cleanNumber.startsWith('9') && cleanNumber.length === 10);
    
    if (!isValidPhilippineNumber) {
      return 'Please enter a valid Philippine phone number (e.g., +639123456789, 09123456789)';
    }
    
    // Auth fields validation (only for new hubs)
    if (!selectedHub) {
      if (!formData.email.trim()) return 'Email is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Please enter a valid email address';
      if (!formData.password.trim()) return 'Password is required';
      if (formData.password.length < 8) return 'Password must be at least 8 characters';
      if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    }
    
    const initialLoad = parseFloat(formData.initial_load);
    if (isNaN(initialLoad) || initialLoad < 0) return 'Initial load must be a valid number (0 or greater)';
    
    return null;
  };

  const handleSave = async () => {
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      setFormLoading(true);
      setFormError(null);

      if (selectedHub) {
        // Update existing hub
        await businessHubService.updateBusinessHub(selectedHub.id, {
          name: formData.name,
          municipality: formData.municipality,
          province: formData.province,
          manager_name: formData.manager_name,
          territory_name: formData.territory_name || `${formData.municipality} Territory`,
          updated_at: new Date().toISOString()
        }, formData.phone_number);
        setSuccessMessage('Business hub updated successfully!');
      } else {
        // Create new hub with auth account and initial load (with 50% bonus)
        const baseInitialLoadAmount = parseFloat(formData.initial_load) || 0;
        const bonusAmount = baseInitialLoadAmount > 0 ? calculateTopUpBonus(baseInitialLoadAmount) : 0;
        const totalInitialLoadAmount = baseInitialLoadAmount > 0 ? calculateTotalTopUp(baseInitialLoadAmount) : 0;
        
        await businessHubService.createBusinessHubWithAuthAndLoad({
          name: formData.name,
          municipality: formData.municipality,
          province: formData.province,
          manager_name: formData.manager_name,
          territory_name: formData.territory_name || `${formData.municipality} Territory`,
          phone_number: formData.phone_number,
          initial_load_amount: totalInitialLoadAmount, // Apply bonus to the actual balance
          email: formData.email,
          password: formData.password
        });
        
        const loadMessage = baseInitialLoadAmount > 0 
          ? ` with ₱${totalInitialLoadAmount.toLocaleString()} starting balance (₱${baseInitialLoadAmount.toLocaleString()} + ₱${bonusAmount.toLocaleString()} bonus)`
          : '';
        setSuccessMessage(`Business hub and mobile app account created successfully${loadMessage}!`);
      }

      // Refresh the list
      await fetchBusinessHubs();
      await fetchStatistics();
      
      // Close modal after success
      setTimeout(() => {
        setShowModal(false);
        setSelectedHub(null);
        setSuccessMessage(null);
      }, 2000);

    } catch (err: any) {
      console.error('Error saving business hub:', err);
      setFormError(err.message || 'Failed to save business hub');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteClick = (hub: BusinessHub) => {
    setHubToDelete(hub);
    setDeleteError(null);
    setDeleteConfirmationName('');
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!hubToDelete) return;

    // Check if name confirmation matches
    if (deleteConfirmationName !== hubToDelete.name) {
      setDeleteError('Please type the exact hub name to confirm deletion');
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteError(null);
      
      await businessHubService.deleteBusinessHub(hubToDelete.id);
      
      setSuccessMessage('Business hub deleted successfully!');
      setShowDeleteModal(false);
      setHubToDelete(null);
      setDeleteConfirmationName('');
      
      // Refresh the list
      await fetchBusinessHubs();
      await fetchStatistics();
      
      // Clear success message after delay
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error deleting business hub:', err);
      setDeleteError(err.message || 'Failed to delete business hub');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setHubToDelete(null);
    setDeleteError(null);
    setDeleteConfirmationName('');
    setIsDeleting(false);
  };

  const handleTopUpClick = (hub: BusinessHub) => {
    setSelectedHubForTopUp(hub);
    setTopUpAmount('');
    setTopUpError(null);
    setTopUpSuccess(null);
    setShowTopUpModal(true);
  };

  const calculateTopUpBonus = (amount: number): number => {
    return amount * (businessHubBonusRate / 100); // Dynamic bonus from system config
  };

  const calculateTotalTopUp = (amount: number): number => {
    return amount + calculateTopUpBonus(amount);
  };

  const handleTopUpSubmit = async () => {
    if (!selectedHubForTopUp) return;

    const amount = parseFloat(topUpAmount);
    
    // Validation
    if (isNaN(amount) || amount <= 0) {
      setTopUpError('Please enter a valid amount greater than 0');
      return;
    }

    if (amount < 100) {
      setTopUpError('Minimum top-up amount is ₱100');
      return;
    }

    if (amount > 100000) {
      setTopUpError('Maximum top-up amount is ₱100,000');
      return;
    }

    try {
      setTopUpLoading(true);
      setTopUpError(null);

      const bonusAmount = calculateTopUpBonus(amount);
      const totalAmount = calculateTotalTopUp(amount);

      // Update Business Hub balance with bonus
      await businessHubService.updateBusinessHub(selectedHubForTopUp.id, {
        current_balance: (selectedHubForTopUp.current_balance || 0) + totalAmount,
        updated_at: new Date().toISOString()
      });

      setTopUpSuccess(`Successfully added ₱${totalAmount.toLocaleString()} (₱${amount.toLocaleString()} + ₱${bonusAmount.toLocaleString()} bonus) to ${selectedHubForTopUp.name}`);
      
      // Refresh the hub list to show updated balance
      await fetchBusinessHubs();
      await fetchStatistics();
      
      // Clear form
      setTopUpAmount('');
      
      // Close modal after delay
      setTimeout(() => {
        setShowTopUpModal(false);
        setSelectedHubForTopUp(null);
        setTopUpSuccess(null);
      }, 2500);

    } catch (err: any) {
      console.error('Error processing top-up:', err);
      setTopUpError(err.message || 'Failed to process top-up');
    } finally {
      setTopUpLoading(false);
    }
  };

  const handleTopUpCancel = () => {
    setShowTopUpModal(false);
    setSelectedHubForTopUp(null);
    setTopUpAmount('');
    setTopUpError(null);
    setTopUpSuccess(null);
  };

  const handleViewStationsClick = async (hub: BusinessHub) => {
    setSelectedHubForStations(hub);
    setStationsError(null);
    setLoadingStationsData([]);
    setShowViewStationsModal(true);
    
    try {
      setStationsLoading(true);
      const stations = await loadingStationService.getLoadingStationsByBusinessHub(hub.id);
      setLoadingStationsData(stations || []);
    } catch (err: any) {
      console.error('Error fetching loading stations:', err);
      setStationsError(err.message || 'Failed to load loading stations');
    } finally {
      setStationsLoading(false);
    }
  };

  const handleViewStationsClose = () => {
    setShowViewStationsModal(false);
    setSelectedHubForStations(null);
    setLoadingStationsData([]);
    setStationsError(null);
    setStationsLoading(false);
  };

  // Helper function to format timestamp
  const formatTimestamp = () => {
    return new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  // Helper function to get templates for current status
  const getTemplatesForStatus = (status: string) => {
    return statusTemplates[status as keyof typeof statusTemplates] || [];
  };

  // Helper function to handle template selection
  const handleTemplateSelection = (template: string) => {
    if (template === 'custom') {
      setStatusChangeReason('');
      setSelectedTemplate('custom');
    } else {
      setStatusChangeReason(template);
      setSelectedTemplate(template);
    }
  };

  // Helper function to format final notes
  const formatFinalNotes = (currentNotes: string, newNote: string, action: 'append' | 'replace', statusChange?: { from: string, to: string }) => {
    const timestamp = formatTimestamp();
    const adminName = 'Admin'; // You can get this from auth context
    
    let formattedNewNote = `[${timestamp}] ${adminName}`;
    if (statusChange) {
      formattedNewNote += ` - Status: ${statusChange.from} → ${statusChange.to}`;
    }
    formattedNewNote += `\n${newNote}`;
    
    if (action === 'append' && currentNotes?.trim()) {
      return `${currentNotes}\n\n${formattedNewNote}`;
    } else {
      return formattedNewNote;
    }
  };

  // Preview of final notes
  const getNotesPreview = () => {
    if (!selectedHubForStatus || !statusChangeReason.trim()) return '';
    
    const currentNotes = selectedHubForStatus.admin_notes || '';
    const statusChange = {
      from: selectedHubForStatus.users?.status || 'unknown',
      to: newStatus
    };
    
    return formatFinalNotes(currentNotes, statusChangeReason, notesAction, statusChange);
  };

  const handleStatusChangeClick = (hub: BusinessHub) => {
    setSelectedHubForStatus(hub);
    setNewStatus(hub.users?.status || 'pending');
    setStatusChangeReason('');
    setSelectedTemplate('');
    setNotesAction('append');
    setStatusError(null);
    setStatusSuccess(null);
    setShowStatusModal(true);
  };

  const handleStatusChangeSubmit = async () => {
    if (!selectedHubForStatus || !newStatus) return;

    try {
      setStatusLoading(true);
      setStatusError(null);

      // Format final notes with timestamp and status change context
      const statusChange = {
        from: selectedHubForStatus.users?.status || 'unknown',
        to: newStatus
      };
      
      const finalNotes = statusChangeReason.trim() 
        ? formatFinalNotes(selectedHubForStatus.admin_notes || '', statusChangeReason, notesAction, statusChange)
        : selectedHubForStatus.admin_notes || '';

      // Update user account status with formatted admin notes
      await businessHubService.updateBusinessHubStatus(selectedHubForStatus.id, {
        status: newStatus,
        notes: finalNotes
      });

      setStatusSuccess(`Successfully updated ${selectedHubForStatus.name} status to ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`);
      
      // Refresh the hub list to show updated status
      await fetchBusinessHubs();
      await fetchStatistics();
      
      // Close modal after delay
      setTimeout(() => {
        setShowStatusModal(false);
        setSelectedHubForStatus(null);
        setStatusSuccess(null);
      }, 2500);

    } catch (err: any) {
      console.error('Error updating business hub status:', err);
      setStatusError(err.message || 'Failed to update status');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleStatusChangeCancel = () => {
    setShowStatusModal(false);
    setSelectedHubForStatus(null);
    setNewStatus('');
    setStatusChangeReason('');
    setSelectedTemplate('');
    setNotesAction('append');
    setStatusError(null);
    setStatusSuccess(null);
  };

  // Click outside handler for dropdown - simplified version
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown) {
        const target = event.target as Element;
        
        // Only close if clicking completely outside all dropdown-related elements
        const isRelatedToDropdown = target.closest('.dropdown-container') || 
                                   target.closest('.enhanced-dropdown') ||
                                   target.closest('[class*="dropdown"]');
        
        if (!isRelatedToDropdown) {
          setOpenDropdown(null);
          setSelectedHubForDropdown(null);
        }
      }
    };

    // Only attach listeners if dropdown is open
    if (openDropdown) {
      // Use a timeout to prevent immediate closure when opening
      const timeoutId = setTimeout(() => {
        document.addEventListener('click', handleClickOutside, true);
      }, 50);
      
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('click', handleClickOutside, true);
      };
    }
  }, [openDropdown]);

  // Toggle dropdown for specific hub with smart positioning
  const toggleDropdown = (hubId: string, event: React.MouseEvent) => {
    if (openDropdown === hubId) {
      setOpenDropdown(null);
      setSelectedHubForDropdown(null);
      return;
    }

    // Find and store the selected hub
    const hub = businessHubs.find(h => h.id === hubId);
    if (!hub) {
      console.error('Hub not found for ID:', hubId);
      return;
    }
    setSelectedHubForDropdown(hub);

    // Calculate smart positioning with absolute coordinates for portal
    const button = event.currentTarget as HTMLElement;
    const buttonRect = button.getBoundingClientRect();
    
    // Estimate dropdown height (approximately 280px for 6 items + separators) and width
    const dropdownHeight = 280;
    const dropdownWidth = 224; // w-56 = 14rem = 224px
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    // Calculate available space in all directions
    const spaceBelow = viewportHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;
    const spaceRight = viewportWidth - buttonRect.right;
    const spaceLeft = buttonRect.left;
    
    // Decide vertical positioning: show upward if not enough space below and enough space above
    const shouldShowUp = spaceBelow < dropdownHeight && spaceAbove > dropdownHeight;
    
    // Calculate horizontal positioning: prefer right alignment but switch if not enough space
    const shouldAlignRight = spaceRight >= dropdownWidth;
    
    // Calculate absolute coordinates
    let top: number;
    let left: number;
    let right: number | undefined;
    
    if (shouldShowUp) {
      top = buttonRect.top - dropdownHeight - 8; // 8px gap
    } else {
      top = buttonRect.bottom + 8; // 8px gap
    }
    
    if (shouldAlignRight) {
      left = buttonRect.right - dropdownWidth;
    } else {
      left = Math.max(8, buttonRect.left); // Ensure it doesn't go off-screen
      // If still not enough space, adjust width dynamically
      if (left + dropdownWidth > viewportWidth - 8) {
        right = 8;
        left = Math.max(8, viewportWidth - dropdownWidth - 8);
      }
    }
    
    // Ensure dropdown doesn't go above viewport
    top = Math.max(8, Math.min(top, viewportHeight - dropdownHeight - 8));
    
    setDropdownPosition(prev => ({
      ...prev,
      [hubId]: shouldShowUp ? 'up' : 'down'
    }));
    
    setDropdownCoords(prev => ({
      ...prev,
      [hubId]: { top, left, right }
    }));
    
    setOpenDropdown(hubId);
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-deep-black">Business Hubs Management</h1>
          <p className="text-gray-600 mt-1">Manage municipality and city level hubs across territories</p>
        </div>
        <button
          onClick={handleCreate}
          className="lagona-gradient text-pure-white px-6 py-3 rounded-lg font-semibold lagona-hover lagona-shadow"
        >
          + Create Business Hub
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-pure-white rounded-xl p-6 lagona-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Hubs</p>
              <p className="text-3xl font-bold text-deep-black mt-2">{loading ? '...' : (statistics?.totalHubs || businessHubs.length)}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-2 0H7m5 0v-5a2 2 0 00-2-2H8a2 2 0 00-2 2v5m5 0V7a2 2 0 012-2h4a2 2 0 012 2v4.8"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-pure-white rounded-xl p-6 lagona-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Hubs</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {loading ? '...' : (statistics?.activeHubs || displayHubs.filter(h => h.users?.status === 'active').length)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-green-50">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-pure-white rounded-xl p-6 lagona-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Loading Stations</p>
              <p className="text-3xl font-bold text-deep-black mt-2">
                {businessHubs.reduce((sum, hub) => sum + (hub.loadingStationsCount || 0), 0)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-purple-50">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-pure-white rounded-xl p-6 lagona-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-deep-black mt-2">
                {loading ? '...' : `₱${((statistics?.totalRevenue || 0) / 1000000).toFixed(1)}M`}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-orange-50">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Business Hubs Table */}
      <div className="bg-pure-white rounded-xl lagona-shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-deep-black">Business Hubs Directory</h2>

            {/* Enhanced Location Filters */}
            <div className="flex gap-3">
              {/* Location Validation Filter */}
              <select
                value={locationValidationFilter}
                onChange={(e) => setLocationValidationFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Validation Status</option>
                <option value="valid">✓ Valid</option>
                <option value="pending">⏳ Pending</option>
                <option value="needs_review">⚠ Needs Review</option>
                <option value="invalid">✗ Invalid</option>
                <option value="none">No Status</option>
              </select>

              {/* Location Accuracy Filter */}
              <select
                value={locationAccuracyFilter}
                onChange={(e) => setLocationAccuracyFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Accuracy Levels</option>
                <option value="high">⭐ High Accuracy ({'≤'}10m)</option>
                <option value="medium">🟡 Medium Accuracy (11-50m)</option>
                <option value="low">🔴 Low Accuracy ({'>'}50m)</option>
                <option value="none">No Accuracy Data</option>
              </select>

              {/* Plus Code Filter */}
              <select
                value={plusCodeFilter}
                onChange={(e) => setPlusCodeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Plus Code Status</option>
                <option value="has">📍 Has Plus Code</option>
                <option value="missing">📍 Missing Plus Code</option>
              </select>

              {/* Clear Filters Button */}
              {(locationValidationFilter !== 'all' || locationAccuracyFilter !== 'all' || plusCodeFilter !== 'all') && (
                <button
                  onClick={() => {
                    setLocationValidationFilter('all');
                    setLocationAccuracyFilter('all');
                    setPlusCodeFilter('all');
                  }}
                  className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Filter Summary */}
          {(locationValidationFilter !== 'all' || locationAccuracyFilter !== 'all' || plusCodeFilter !== 'all') && (
            <div className="mt-3 text-sm text-gray-600">
              Showing {displayHubs.length} of {businessHubs.length} business hubs
              {locationValidationFilter !== 'all' && ` • Validation: ${locationValidationFilter}`}
              {locationAccuracyFilter !== 'all' && ` • Accuracy: ${locationAccuracyFilter}`}
              {plusCodeFilter !== 'all' && ` • Plus Code: ${plusCodeFilter}`}
            </div>
          )}
        </div>
        <div className="relative business-hubs-table">
          <div className="min-w-full">
            <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Hub Details</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Manager Info</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Location</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Territory</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Stations & Revenue</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Balance Info</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status & Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    Loading business hubs...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : displayHubs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No business hubs found
                  </td>
                </tr>
              ) : displayHubs.map((hub) => (
                <tr key={hub.id} className="hover:bg-gray-50">
                  {/* Hub Details */}
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-semibold text-deep-black">{hub.name}</div>
                      <div className="text-sm text-gray-600">
                        BHCODE: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{hub.bhcode}</span>
                      </div>
                      <div className="text-sm text-gray-500">{hub.municipality}, {hub.province}</div>
                    </div>
                  </td>
                  
                  {/* Manager Info */}
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{hub.manager_name || 'N/A'}</div>
                      {hub.users?.phone_number && (
                        <div className="text-sm text-gray-600 flex items-center mt-1">
                          <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {hub.users.phone_number}
                        </div>
                      )}
                      {hub.users?.email && (
                        <div className="text-sm text-gray-600 flex items-center mt-1">
                          <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {hub.users.email}
                        </div>
                      )}
                      {!hub.users?.phone_number && !hub.users?.email && (
                        <div className="text-sm text-gray-400">No contact info</div>
                      )}
                    </div>
                  </td>

                  {/* Location */}
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {hub.municipality}, {hub.province}
                      </div>
                      {hub.region && (
                        <div className="text-xs text-gray-500">{hub.region}</div>
                      )}
                      {hub.hierarchical_address && (
                        <div className="text-xs text-gray-400 truncate max-w-32" title={hub.hierarchical_address}>
                          {hub.hierarchical_address}
                        </div>
                      )}

                      {/* Plus Code */}
                      {(() => {
                        const hubLocationInfo = extractLegacyLocationData(hub);
                        return hubLocationInfo.plus_code ? (
                          <a
                            href={`https://plus.codes/${hubLocationInfo.plus_code.split(' ')[0]}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-orange-600 font-mono bg-orange-50 px-2 py-1 rounded mt-1 inline-block hover:bg-orange-100 hover:text-orange-700 transition-colors"
                          >
                            <span className="font-medium">Plus:</span> {hubLocationInfo.plus_code}
                          </a>
                        ) : null;
                      })()}

                      <div className="flex gap-1 mt-2">
                        {(hub.coordinates || hub.territory_boundaries) && (
                          <button
                            onClick={() => {
                              setSelectedHubForLocation(hub);
                              setShowMapVisualization(true);
                            }}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Map
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedHubForLocation(hub);
                            setShowLocationModal(true);
                          }}
                          className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 transition-colors"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Details
                        </button>
                      </div>
                    </div>
                  </td>

                  {/* Territory */}
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{hub.territory_name || hub.municipality}</div>
                    <div className="text-sm text-gray-500">Commission: {hub.commission_rate || 50}%</div>
                  </td>
                  {/* Stations & Revenue */}
                  <td className="px-6 py-4">
                    <div className="text-lg font-bold text-deep-black">{hub.loadingStationsCount || 0}</div>
                    <div className="text-sm text-gray-500">loading stations</div>
                    <div className="text-sm font-medium text-green-600 mt-1">
                      ₱{((hub.total_revenue || 0) / 1000).toFixed(1)}K revenue
                    </div>
                  </td>
                  {/* Balance Info */}
                  <td className="px-6 py-4">
                    <div className="text-lg font-semibold text-blue-600">₱{(hub.current_balance || 0).toLocaleString()}</div>
                    <div className="text-sm text-gray-500">current balance</div>
                    {hub.initial_balance && hub.initial_balance > 0 && (
                      <div className="text-xs text-gray-400">Initial: ₱{hub.initial_balance.toLocaleString()}</div>
                    )}
                  </td>
                  {/* Status & Date */}
                  <td className="px-6 py-4">
                    <div className="mb-2">
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(hub.users?.status || 'pending')}`}>
                        {(hub.users?.status || 'pending').charAt(0).toUpperCase() + (hub.users?.status || 'pending').slice(1)}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">Account Status</div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {hub.created_at ? new Date(hub.created_at).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>
                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="relative dropdown-container">
                      {/* Enhanced Three dots button */}
                      <button
                        onClick={(e) => toggleDropdown(hub.id, e)}
                        className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                        aria-label={`More actions for ${hub.name}`}
                        title="More actions"
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
                        </svg>
                      </button>

                      {/* Dropdown will be rendered via portal */}
                      {false && (
                        <div 
                          className={`absolute right-0 w-56 enhanced-dropdown rounded-xl z-[60] py-2 ${
                            dropdownPosition[hub.id] === 'up' 
                              ? 'bottom-12 animate-slide-up' 
                              : 'top-12 animate-slide-down'
                          }`}
                          style={{
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                          }}
                        >
                          {/* Edit */}
                          <button
                            onClick={() => {
                              handleEdit(hub);
                              setOpenDropdown(null);
                            }}
                            className="enhanced-dropdown-item flex items-center w-full px-4 py-3 text-sm font-medium text-blue-600 hover:bg-blue-50 group"
                          >
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 mr-3 group-hover:bg-blue-200 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </div>
                            <span>Edit Details</span>
                          </button>
                          
                          {/* Change Status */}
                          <button
                            onClick={() => {
                              handleStatusChangeClick(hub);
                              setOpenDropdown(null);
                            }}
                            className="enhanced-dropdown-item flex items-center w-full px-4 py-3 text-sm font-medium text-orange-600 hover:bg-orange-50 group"
                          >
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100 mr-3 group-hover:bg-orange-200 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <span>Change Status</span>
                          </button>
                          
                          {/* View Stations */}
                          <button
                            onClick={() => {
                              handleViewStationsClick(hub);
                              setOpenDropdown(null);
                            }}
                            className="enhanced-dropdown-item flex items-center w-full px-4 py-3 text-sm font-medium text-green-600 hover:bg-green-50 group"
                          >
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 mr-3 group-hover:bg-green-200 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              </svg>
                            </div>
                            <span>View Stations</span>
                          </button>
                          
                          {/* Top-up */}
                          <button
                            onClick={() => {
                              handleTopUpClick(hub);
                              setOpenDropdown(null);
                            }}
                            className="enhanced-dropdown-item flex items-center w-full px-4 py-3 text-sm font-medium text-purple-600 hover:bg-purple-50 group"
                          >
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 mr-3 group-hover:bg-purple-200 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </div>
                            <span>Add Balance</span>
                          </button>
                          
                          {/* View History */}
                          <button
                            onClick={() => {
                              setAuditEntityId(hub.id);
                              setAuditEntityName(hub.name);
                              setShowAuditModal(true);
                              setOpenDropdown(null);
                            }}
                            className="enhanced-dropdown-item flex items-center w-full px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 group"
                          >
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 mr-3 group-hover:bg-gray-200 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <span>View History</span>
                          </button>
                          
                          {/* Separator */}
                          <div className="h-px bg-gray-200 mx-2 my-2"></div>
                          
                          {/* Delete */}
                          <button
                            onClick={() => {
                              handleDeleteClick(hub);
                              setOpenDropdown(null);
                            }}
                            className="enhanced-dropdown-item flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 group"
                          >
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 mr-3 group-hover:bg-red-200 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </div>
                            <span>Delete Hub</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Portal-based Dropdown Menu */}
      {openDropdown && dropdownCoords[openDropdown] && selectedHubForDropdown && typeof window !== 'undefined' && createPortal(
        <div 
          className={`fixed w-56 enhanced-dropdown rounded-xl z-[9999] py-2 ${
            dropdownPosition[openDropdown] === 'up' 
              ? 'animate-slide-up' 
              : 'animate-slide-down'
          }`}
          style={{
            top: dropdownCoords[openDropdown].top,
            left: dropdownCoords[openDropdown].left,
            right: dropdownCoords[openDropdown].right,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}
          onMouseDown={(e) => {
            // Prevent the mousedown event from bubbling to document
            e.stopPropagation();
          }}
        >
          {(() => {
            const hub = selectedHubForDropdown;
            if (!hub) {
              console.error('No selected hub for dropdown');
              return null;
            }
            
            return (
              <>
                {/* Edit */}
                <button
                  onClick={() => {
                    console.log('Edit button clicked for hub:', hub.name, hub.id);
                    try {
                      handleEdit(hub);
                      setOpenDropdown(null);
                      setSelectedHubForDropdown(null);
                      console.log('Edit handler completed successfully');
                    } catch (error) {
                      console.error('Error in edit handler:', error);
                    }
                  }}
                  className="enhanced-dropdown-item flex items-center w-full px-4 py-3 text-sm font-medium text-blue-600 hover:bg-blue-50 group"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 mr-3 group-hover:bg-blue-200 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <span>Edit Details</span>
                </button>
                
                {/* Change Status */}
                <button
                  onClick={() => {
                    console.log('Status button clicked for hub:', hub.name, hub.id);
                    try {
                      handleStatusChangeClick(hub);
                      setOpenDropdown(null);
                      setSelectedHubForDropdown(null);
                      console.log('Status change handler completed successfully');
                    } catch (error) {
                      console.error('Error in status change handler:', error);
                    }
                  }}
                  className="enhanced-dropdown-item flex items-center w-full px-4 py-3 text-sm font-medium text-orange-600 hover:bg-orange-50 group"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100 mr-3 group-hover:bg-orange-200 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span>Change Status</span>
                </button>
                
                {/* View Stations */}
                <button
                  onClick={() => {
                    console.log('View Stations button clicked for hub:', hub.name, hub.id);
                    try {
                      handleViewStationsClick(hub);
                      setOpenDropdown(null);
                      setSelectedHubForDropdown(null);
                      console.log('View stations handler completed successfully');
                    } catch (error) {
                      console.error('Error in view stations handler:', error);
                    }
                  }}
                  className="enhanced-dropdown-item flex items-center w-full px-4 py-3 text-sm font-medium text-green-600 hover:bg-green-50 group"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 mr-3 group-hover:bg-green-200 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  </div>
                  <span>View Stations</span>
                </button>
                
                {/* Top Up */}
                <button
                  onClick={() => {
                    console.log('Top Up button clicked for hub:', hub.name, hub.id);
                    try {
                      handleTopUpClick(hub);
                      setOpenDropdown(null);
                      setSelectedHubForDropdown(null);
                      console.log('Top up handler completed successfully');
                    } catch (error) {
                      console.error('Error in top up handler:', error);
                    }
                  }}
                  className="enhanced-dropdown-item flex items-center w-full px-4 py-3 text-sm font-medium text-purple-600 hover:bg-purple-50 group"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 mr-3 group-hover:bg-purple-200 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <span>Add Balance</span>
                </button>
                
                {/* View History */}
                <button
                  onClick={() => {
                    console.log('View History button clicked for hub:', hub.name, hub.id);
                    try {
                      setAuditEntityId(hub.id);
                      setAuditEntityName(hub.name);
                      setShowAuditModal(true);
                      setOpenDropdown(null);
                      setSelectedHubForDropdown(null);
                      console.log('View history handler completed successfully');
                    } catch (error) {
                      console.error('Error in view history handler:', error);
                    }
                  }}
                  className="enhanced-dropdown-item flex items-center w-full px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 group"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 mr-3 group-hover:bg-gray-200 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span>View History</span>
                </button>
                
                {/* Separator */}
                <div className="h-px bg-gray-200 mx-2 my-2"></div>
                
                {/* Delete */}
                <button
                  onClick={() => {
                    console.log('Delete button clicked for hub:', hub.name, hub.id);
                    try {
                      handleDeleteClick(hub);
                      setOpenDropdown(null);
                      setSelectedHubForDropdown(null);
                      console.log('Delete handler completed successfully');
                    } catch (error) {
                      console.error('Error in delete handler:', error);
                    }
                  }}
                  className="enhanced-dropdown-item flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 group"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 mr-3 group-hover:bg-red-200 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <span>Delete Hub</span>
                </button>
              </>
            );
          })()}
        </div>,
        document.body
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-pure-white rounded-xl p-8 max-w-2xl w-full mx-4 lagona-shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                {selectedHub ? (
                  <div className="p-2 bg-blue-50 rounded-xl">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                ) : (
                  <div className="p-2 bg-green-50 rounded-xl">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-semibold text-deep-black">
                    {selectedHub ? 'Edit Business Hub' : 'Create New Business Hub'}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedHub ? 'Update business hub information' : 'Set up a new municipality/city level management hub'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Error Message */}
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {formError}
              </div>
            )}

            {/* Success Message in Modal */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {successMessage}
              </div>
            )}

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-deep-black mb-2">Hub Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                    placeholder="e.g., Cebu City Hub"
                    disabled={formLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-deep-black mb-2">BHCODE</label>
                  <input
                    type="text"
                    value={selectedHub?.bhcode || 'Auto-generated'}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                    placeholder="Auto-generated"
                    disabled
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-deep-black mb-2">Municipality *</label>
                  <input
                    type="text"
                    value={formData.municipality}
                    onChange={(e) => handleInputChange('municipality', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                    placeholder="e.g., Cebu City"
                    disabled={formLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-deep-black mb-2">Province *</label>
                  <input
                    type="text"
                    value={formData.province}
                    onChange={(e) => handleInputChange('province', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                    placeholder="e.g., Cebu"
                    disabled={formLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-deep-black mb-2">Territory Name</label>
                <input
                  type="text"
                  value={formData.territory_name}
                  onChange={(e) => handleInputChange('territory_name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                  placeholder="e.g., Metro Cebu (leave blank to auto-generate)"
                  disabled={formLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-deep-black mb-2">Manager Name *</label>
                <input
                  type="text"
                  value={formData.manager_name}
                  onChange={(e) => handleInputChange('manager_name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                  placeholder="e.g., Juan Santos"
                  disabled={formLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-deep-black mb-2">Phone Number *</label>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => handleInputChange('phone_number', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                  placeholder="e.g., 09123456789 → auto-formats to +639123456789"
                  disabled={formLoading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Philippine numbers auto-format (09XXXXXXXXX → +639XXXXXXXXX)
                </p>
              </div>

              {!selectedHub && (
                <>
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-deep-black mb-4">Mobile App Access Credentials</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Business Hub manager will use these credentials to login to their mobile app
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-deep-black mb-2">Email Address *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                        placeholder="e.g., manager@cebu.gov.ph"
                        disabled={formLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-deep-black mb-2">Password *</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                          placeholder="Minimum 8 characters"
                          disabled={formLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                          disabled={formLoading}
                        >
                          {showPassword ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-deep-black mb-2">Confirm Password *</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                        placeholder="Re-enter password"
                        disabled={formLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                        disabled={formLoading}
                      >
                        {showConfirmPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-deep-black mb-2">Initial Load Amount (₱)</label>
                    <input
                      type="number"
                      value={formData.initial_load}
                      onChange={(e) => handleInputChange('initial_load', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                      placeholder="e.g., 5000"
                      min="0"
                      step="0.01"
                      disabled={formLoading}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Starting balance for the business hub (optional) • {businessHubBonusRate}% bonus will be applied
                    </p>
                    
                    {/* Initial Load Bonus Preview */}
                    {formData.initial_load && !isNaN(parseFloat(formData.initial_load)) && parseFloat(formData.initial_load) > 0 && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-2">
                        <h4 className="text-sm font-semibold text-orange-800 mb-2">Initial Load Preview</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-orange-700">Load Amount:</span>
                            <span className="font-medium text-orange-900">₱{parseFloat(formData.initial_load).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-orange-700">{businessHubBonusRate}% Bonus:</span>
                            <span className="font-medium text-green-600">₱{calculateTopUpBonus(parseFloat(formData.initial_load)).toLocaleString()}</span>
                          </div>
                          <div className="border-t border-orange-300 pt-1 flex justify-between">
                            <span className="font-semibold text-orange-800">Total Starting Balance:</span>
                            <span className="font-bold text-orange-900">₱{calculateTotalTopUp(parseFloat(formData.initial_load)).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="flex space-x-4 pt-6">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={formLoading}
                  className={`flex-1 lagona-gradient text-pure-white py-3 rounded-lg font-semibold lagona-hover lagona-shadow ${
                    formLoading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {formLoading ? 'Saving...' : (selectedHub ? 'Update Hub' : 'Create Hub')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={formLoading}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && hubToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100 transform animate-in">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-red-50 rounded-xl">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Delete Business Hub</h2>
                  <p className="text-gray-600 mt-1">This action cannot be undone</p>
                </div>
              </div>
              <button 
                onClick={handleDeleteCancel}
                disabled={isDeleting}
                className="text-gray-400 hover:text-gray-600 text-2xl hover:bg-gray-100 w-10 h-10 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
              >
                ×
              </button>
            </div>
            
            {/* Hub Information */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Hub Name:</span>
                  <span className="text-sm font-semibold text-gray-900">{hubToDelete.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">BHCODE:</span>
                  <span className="text-sm font-mono bg-gray-200 px-2 py-1 rounded text-gray-900">{hubToDelete.bhcode}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Location:</span>
                  <span className="text-sm text-gray-900">{hubToDelete.municipality}, {hubToDelete.province}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Manager:</span>
                  <span className="text-sm text-gray-900">{hubToDelete.manager_name}</span>
                </div>
                {hubToDelete.loadingStationsCount && hubToDelete.loadingStationsCount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Loading Stations:</span>
                    <span className="text-sm font-semibold text-orange-600">{hubToDelete.loadingStationsCount} stations</span>
                  </div>
                )}
              </div>
            </div>

            {/* Warning Message */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h4 className="text-sm font-semibold text-red-800 mb-1">Warning: Permanent Deletion</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• This business hub will be permanently deleted</li>
                    <li>• All associated loading stations may be affected</li>
                    <li>• Transaction history will be preserved</li>
                    <li>• This action cannot be reversed</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {deleteError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                <p className="text-sm text-red-600">{deleteError}</p>
              </div>
            )}

            {/* Name Confirmation */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Type <span className="font-bold text-red-600">"{hubToDelete.name}"</span> to confirm deletion:
              </label>
              <input
                type="text"
                value={deleteConfirmationName}
                onChange={(e) => setDeleteConfirmationName(e.target.value)}
                placeholder={hubToDelete.name}
                disabled={isDeleting}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 disabled:opacity-50"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={handleDeleteCancel}
                disabled={isDeleting}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting || deleteConfirmationName !== hubToDelete.name}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete Business Hub'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit History Modal */}
      {showAuditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-pure-white rounded-xl p-8 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-deep-black">Audit History</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Viewing history for: <strong>{auditEntityName}</strong>
                </p>
              </div>
              <button 
                onClick={() => {
                  setShowAuditModal(false);
                  setAuditEntityId(null);
                  setAuditEntityName(null);
                }}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <AuditHistory 
              entityType="business_hub" 
              entityId={auditEntityId || undefined}
              showFilters={true}
              compact={false}
            />
          </div>
        </div>
      )}

      {/* Top-up Modal */}
      {showTopUpModal && selectedHubForTopUp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-50 rounded-xl">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Top-up Business Hub</h2>
                  <p className="text-gray-600 mt-1">Add funds with {businessHubBonusRate}% bonus</p>
                </div>
              </div>
              <button 
                onClick={handleTopUpCancel}
                disabled={topUpLoading}
                className="text-gray-400 hover:text-gray-600 text-2xl hover:bg-gray-100 w-10 h-10 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
              >
                ×
              </button>
            </div>
            
            {/* Hub Information */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Hub Name:</span>
                  <span className="text-sm font-semibold text-gray-900">{selectedHubForTopUp.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">BHCODE:</span>
                  <span className="text-sm font-mono bg-gray-200 px-2 py-1 rounded text-gray-900">{selectedHubForTopUp.bhcode}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Current Balance:</span>
                  <span className="text-sm font-semibold text-blue-600">₱{(selectedHubForTopUp.current_balance || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Success Message */}
            {topUpSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-green-600">{topUpSuccess}</p>
              </div>
            )}

            {/* Error Message */}
            {topUpError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-red-600">{topUpError}</p>
              </div>
            )}

            {/* Top-up Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Top-up Amount (₱)
                </label>
                <input
                  type="number"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  placeholder="Enter amount (minimum ₱100)"
                  disabled={topUpLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 disabled:opacity-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum: ₱100 • Maximum: ₱100,000
                </p>
              </div>

              {/* Bonus Calculation Preview */}
              {topUpAmount && !isNaN(parseFloat(topUpAmount)) && parseFloat(topUpAmount) > 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-purple-800 mb-2">Transaction Preview</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-purple-700">Top-up Amount:</span>
                      <span className="font-medium text-purple-900">₱{parseFloat(topUpAmount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700">{businessHubBonusRate}% Bonus:</span>
                      <span className="font-medium text-green-600">₱{calculateTopUpBonus(parseFloat(topUpAmount)).toLocaleString()}</span>
                    </div>
                    <div className="border-t border-purple-300 pt-1 flex justify-between">
                      <span className="font-semibold text-purple-800">Total Credit:</span>
                      <span className="font-bold text-purple-900">₱{calculateTotalTopUp(parseFloat(topUpAmount)).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>New Balance:</span>
                      <span className="font-medium">₱{((selectedHubForTopUp.current_balance || 0) + calculateTotalTopUp(parseFloat(topUpAmount))).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 mt-6">
              <button
                onClick={handleTopUpCancel}
                disabled={topUpLoading}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleTopUpSubmit}
                disabled={topUpLoading || !topUpAmount || isNaN(parseFloat(topUpAmount)) || parseFloat(topUpAmount) <= 0}
                className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {topUpLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Confirm Top-up'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Management Modal */}
      {showStatusModal && selectedHubForStatus && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-50 rounded-xl">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Update Account Status</h2>
                  <p className="text-gray-600 mt-1">Change business hub account status</p>
                </div>
              </div>
              <button 
                onClick={handleStatusChangeCancel}
                disabled={statusLoading}
                className="text-gray-400 hover:text-gray-600 text-2xl hover:bg-gray-100 w-10 h-10 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
              >
                ×
              </button>
            </div>
            
            {/* Hub Information */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Hub Name:</span>
                  <span className="text-sm font-semibold text-gray-900">{selectedHubForStatus.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">BHCODE:</span>
                  <span className="text-sm font-mono bg-gray-200 px-2 py-1 rounded text-gray-900">{selectedHubForStatus.bhcode}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Current Status:</span>
                  <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                    selectedHubForStatus.users?.status === 'active' ? 'text-green-600 bg-green-100' :
                    selectedHubForStatus.users?.status === 'inactive' ? 'text-red-600 bg-red-100' :
                    selectedHubForStatus.users?.status === 'suspended' ? 'text-red-600 bg-red-100' :
                    'text-yellow-600 bg-yellow-100'
                  }`}>
                    {(selectedHubForStatus.users?.status || 'pending').charAt(0).toUpperCase() + (selectedHubForStatus.users?.status || 'pending').slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Success Message */}
            {statusSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-green-600">{statusSuccess}</p>
              </div>
            )}

            {/* Error Message */}
            {statusError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-red-600">{statusError}</p>
              </div>
            )}

            {/* Status Selection Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  New Account Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => {
                    setNewStatus(e.target.value);
                    setSelectedTemplate('');
                    setStatusChangeReason('');
                  }}
                  disabled={statusLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-gray-900 disabled:opacity-50"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              {/* Template Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Reason Template
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => handleTemplateSelection(e.target.value)}
                  disabled={statusLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-gray-900 disabled:opacity-50"
                >
                  <option value="">Select a template...</option>
                  {getTemplatesForStatus(newStatus).map((template, index) => (
                    <option key={index} value={template}>
                      {template}
                    </option>
                  ))}
                  <option value="custom">Custom reason...</option>
                </select>
              </div>

              {/* Notes Action Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Notes Action
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="notesAction"
                      value="append"
                      checked={notesAction === 'append'}
                      onChange={(e) => setNotesAction(e.target.value as 'append' | 'replace')}
                      disabled={statusLoading}
                      className="mr-2 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">Add to existing notes</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="notesAction"
                      value="replace"
                      checked={notesAction === 'replace'}
                      onChange={(e) => setNotesAction(e.target.value as 'append' | 'replace')}
                      disabled={statusLoading}
                      className="mr-2 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">Replace all notes</span>
                  </label>
                </div>
              </div>

              {/* Current Notes Display */}
              {selectedHubForStatus.admin_notes && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Current Notes
                  </label>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 max-h-24 overflow-y-auto">
                    <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">
                      {selectedHubForStatus.admin_notes}
                    </pre>
                  </div>
                </div>
              )}

              {/* Notes Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Status Change Notes
                </label>
                <textarea
                  value={statusChangeReason}
                  onChange={(e) => {
                    setStatusChangeReason(e.target.value);
                    if (e.target.value && selectedTemplate !== 'custom') {
                      setSelectedTemplate('custom');
                    }
                  }}
                  placeholder={selectedTemplate === 'custom' || !selectedTemplate ? 
                    "Add admin notes, approval reason, rejection reason, or any comments..." :
                    "Template selected. You can modify the text above or add additional notes..."
                  }
                  disabled={statusLoading}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 disabled:opacity-50 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {statusChangeReason.length}/500 characters
                </p>
              </div>

              {/* Notes Preview */}
              {statusChangeReason.trim() && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Final Notes Preview
                  </label>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 max-h-32 overflow-y-auto">
                    <pre className="text-xs text-blue-800 whitespace-pre-wrap font-mono">
                      {getNotesPreview()}
                    </pre>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    This is how your notes will appear after the status change.
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 mt-6">
              <button
                onClick={handleStatusChangeCancel}
                disabled={statusLoading}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusChangeSubmit}
                disabled={statusLoading || !newStatus}
                className="flex-1 bg-orange-600 text-white py-3 rounded-xl font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {statusLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  'Update Status'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Stations Modal */}
      {showViewStationsModal && selectedHubForStations && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-6xl w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-50 rounded-xl">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Loading Stations</h2>
                  <p className="text-gray-600 mt-1">
                    {selectedHubForStations.name} • {loadingStationsData.length} station{loadingStationsData.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <button 
                onClick={handleViewStationsClose}
                className="text-gray-400 hover:text-gray-600 text-2xl hover:bg-gray-100 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
              >
                ×
              </button>
            </div>
            
            {/* Business Hub Information */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">BHCODE:</span>
                  <div className="font-mono bg-gray-200 px-2 py-1 rounded text-gray-900 mt-1">{selectedHubForStations.bhcode}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Location:</span>
                  <div className="text-gray-900 mt-1">{selectedHubForStations.municipality}, {selectedHubForStations.province}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Manager:</span>
                  <div className="text-gray-900 mt-1">{selectedHubForStations.manager_name || 'N/A'}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Territory:</span>
                  <div className="text-gray-900 mt-1">{selectedHubForStations.territory_name || selectedHubForStations.municipality}</div>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {stationsLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-3">
                  <svg className="animate-spin h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-gray-600">Loading stations...</span>
                </div>
              </div>
            )}

            {/* Error State */}
            {stationsError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-red-600">{stationsError}</p>
                </div>
              </div>
            )}

            {/* Stations Table */}
            {!stationsLoading && !stationsError && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {loadingStationsData.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="p-3 bg-gray-50 rounded-xl inline-block mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Loading Stations Found</h3>
                    <p className="text-gray-500">This business hub doesn't have any loading stations yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Station Details</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Location & Manager</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Financial Info</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {loadingStationsData.map((station) => (
                          <tr key={station.id} className="hover:bg-gray-50">
                            {/* Station Details */}
                            <td className="px-6 py-4">
                              <div>
                                <div className="font-semibold text-gray-900">{station.name}</div>
                                <div className="text-sm text-gray-600">
                                  LSCODE: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{station.lscode}</span>
                                </div>
                                <div className="text-sm text-gray-500 mt-1">Commission: {station.commission_rate}%</div>
                              </div>
                            </td>
                            
                            {/* Location & Manager */}
                            <td className="px-6 py-4">
                              <div>
                                <div className="font-medium text-gray-900">{station.area}</div>
                                <div className="text-sm text-gray-600">{station.address}</div>
                                <div className="mt-2">
                                  <div className="font-medium text-gray-900">{station.users?.full_name || 'N/A'}</div>
                                  {station.users?.phone_number && (
                                    <div className="text-sm text-gray-600 flex items-center mt-1">
                                      <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                      </svg>
                                      {station.users.phone_number}
                                    </div>
                                  )}
                                  {station.users?.email && (
                                    <div className="text-sm text-gray-600 flex items-center mt-1">
                                      <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                      </svg>
                                      {station.users.email}
                                    </div>
                                  )}
                                  {!station.users?.phone_number && !station.users?.email && (
                                    <div className="text-sm text-gray-400">No contact info</div>
                                  )}
                                </div>
                              </div>
                            </td>
                            
                            {/* Financial Info */}
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-lg font-semibold text-blue-600">
                                  ₱{(station.current_balance || 0).toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-500">current balance</div>
                                <div className="text-sm font-medium text-green-600 mt-1">
                                  ₱{((station.total_revenue || 0) / 1000).toFixed(1)}K revenue
                                </div>
                              </div>
                            </td>
                            
                            {/* Status */}
                            <td className="px-6 py-4">
                              <div>
                                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                                  station.status === 'active' ? 'text-green-600 bg-green-100' :
                                  station.status === 'inactive' ? 'text-red-600 bg-red-100' :
                                  'text-yellow-600 bg-yellow-100'
                                }`}>
                                  {(station.status || 'pending').charAt(0).toUpperCase() + (station.status || 'pending').slice(1)}
                                </span>
                                <div className="text-xs text-gray-500 mt-1">
                                  {station.created_at ? new Date(station.created_at).toLocaleDateString() : 'N/A'}
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Location Modals */}
      <MapVisualization
        businessHub={selectedHubForLocation}
        mode="single"
        isOpen={showMapVisualization}
        onClose={() => {
          setShowMapVisualization(false);
          // Keep selectedHubForLocation intact for reopening
        }}
      />

      <LocationDetailsModal
        businessHub={selectedHubForLocation}
        isOpen={showLocationModal}
        onClose={() => {
          setShowLocationModal(false);
          // Keep selectedHubForLocation intact for reopening
        }}
      />
    </div>
  );
}