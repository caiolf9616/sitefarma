import { describe, it, expect, vi, beforeEach } from 'vitest';
import { medicationService } from '@/services';
import { api } from '@/lib/axios';

vi.mock('@/lib/axios', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('medicationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all medications', async () => {
      const mockMedications = [
        { id: '1', name: 'Dipirona', available: true },
        { id: '2', name: 'Paracetamol', available: true },
      ];
      
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockMedications });
      
      const result = await medicationService.getAll();
      
      expect(api.get).toHaveBeenCalledWith('/medications');
      expect(result).toEqual(mockMedications);
    });
  });

  describe('getById', () => {
    it('should fetch a medication by id', async () => {
      const mockMedication = { id: '1', name: 'Dipirona', available: true };
      
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockMedication });
      
      const result = await medicationService.getById('1');
      
      expect(api.get).toHaveBeenCalledWith('/medications/1');
      expect(result).toEqual(mockMedication);
    });
  });

  describe('create', () => {
    it('should create a new medication', async () => {
      const newMedication = {
        name: 'Ibuprofeno',
        laboratory: 'EMS',
        dosage: '400mg',
        quantity: 100,
        price: 15.99,
        description: 'Anti-inflamatório',
        available: true,
        is_free: false,
      };
      
      const mockResponse = { id: '3', ...newMedication };
      vi.mocked(api.post).mockResolvedValueOnce({ data: mockResponse });
      
      const result = await medicationService.create(newMedication);
      
      expect(api.post).toHaveBeenCalledWith('/medications', newMedication);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('update', () => {
    it('should update a medication', async () => {
      const updateData = {
        name: 'Dipirona Sódica',
        laboratory: 'EMS',
        dosage: '500mg',
        quantity: 50,
        price: 9.99,
        description: 'Analgésico',
        available: false,
        is_free: false,
      };
      const mockResponse = { id: '1', ...updateData };
      
      vi.mocked(api.put).mockResolvedValueOnce({ data: mockResponse });
      
      const result = await medicationService.update('1', updateData);
      
      expect(api.put).toHaveBeenCalledWith('/medications/1', updateData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('delete', () => {
    it('should delete a medication', async () => {
      vi.mocked(api.delete).mockResolvedValueOnce({ data: null });
      
      await medicationService.delete('1');
      
      expect(api.delete).toHaveBeenCalledWith('/medications/1');
    });
  });
});
