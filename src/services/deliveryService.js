
const Delivery = require('../models/Delivery');
const DeliveryHistory = require('../models/DeliveryHistory');
const { calculateDeliveryFee } = require('../utils/feeCalculator');

class DeliveryService {
  async createDelivery(deliveryData) {
    // Calculate delivery fee
    const feeCalculation = calculateDeliveryFee(
      deliveryData.storeLocation,
      deliveryData.customerLocation,
      deliveryData.deliveryType
    );

    // Create delivery
    const delivery = new Delivery({
      ...deliveryData,
      fee: feeCalculation.fee
    });

    await delivery.save();

    // Create history record
    await this.addDeliveryHistory(delivery._id, 'PENDING', {
      userId: "6839995e15456cb015221814",
      userType: 'system'
    });

    return delivery;
  }

  async getAvailableDeliveries() {
    return Delivery.find({ 
      status: 'PENDING',
      riderId: null 
    }).sort({ createdAt: 1 });
  }

  async acceptDelivery(deliveryId, riderId) {
    const delivery = await Delivery.findOne({
      _id: deliveryId,
      status: 'PENDING',
      riderId: null
    });

    if (!delivery) {
      throw new Error('Delivery not available for acceptance');
    }

    delivery.status = 'ACCEPTED';
    delivery.riderId = riderId;
    await delivery.save();

    // Add history
    await this.addDeliveryHistory(deliveryId, 'ACCEPTED', {
      userId: riderId,
      userType: 'rider'
    });

    return delivery;
  }

  async updateDeliveryStatus(deliveryId, status, riderId, updateData = {}) {
    const delivery = await Delivery.findOne({
      _id: deliveryId,
      riderId: riderId
    });

    if (!delivery) {
      throw new Error('Delivery not found or not assigned to this rider');
    }

    // Validate status transitions
    const validTransitions = {
      'ACCEPTED': ['PICKED_UP', 'CANCELLED'],
      'PICKED_UP': ['IN_TRANSIT'],
      'IN_TRANSIT': ['DELIVERED']
    };

    if (!validTransitions[delivery.status]?.includes(status)) {
      throw new Error(`Cannot transition from ${delivery.status} to ${status}`);
    }

    delivery.status = status;
    
    if (status === 'DELIVERED') {
      delivery.actualDeliveryTime = new Date();
    }

    await delivery.save();

    // Add history
    await this.addDeliveryHistory(deliveryId, status, {
      userId: riderId,
      userType: 'rider'
    }, updateData.notes, updateData.location);

    return delivery;
  }

  async cancelDelivery(deliveryId, cancelledBy) {
    const delivery = await Delivery.findById(deliveryId);

    if (!delivery) {
      throw new Error('Delivery not found');
    }

    if (['PICKED_UP', 'IN_TRANSIT', 'DELIVERED'].includes(delivery.status)) {
      throw new Error('Cannot cancel delivery after pickup');
    }

    delivery.status = 'CANCELLED';
    await delivery.save();

    // Add history
    await this.addDeliveryHistory(deliveryId, 'CANCELLED', cancelledBy);

    return delivery;
  }

  async trackDelivery(trackingNumber) {
    const delivery = await Delivery.findOne({ trackingNumber })
      .populate('riderId', 'name phone')
      .lean();

    if (!delivery) {
      throw new Error('Delivery not found');
    }

    const history = await DeliveryHistory.find({ deliveryId: delivery._id })
      .sort({ createdAt: 1 })
      .lean();

    return {
      delivery,
      history
    };
  }

  async addDeliveryHistory(deliveryId, status, updatedBy, notes = null, location = null) {
    const historyRecord = new DeliveryHistory({
      deliveryId,
      status,
      updatedBy,
      notes,
      location
    });

    await historyRecord.save();
    return historyRecord;
  }

  async getDeliveriesByRider(riderId) {
    return Delivery.find({ riderId })
      .sort({ createdAt: -1 })
      .lean();
  }

  async getAllDeliveries(filters = {}) {
    const query = {};
    
    if (filters.status) {
      query.status = filters.status;
    }
    
    if (filters.riderId) {
      query.riderId = filters.riderId;
    }

    return Delivery.find(query)
      .populate('riderId', 'name phone email')
      .sort({ createdAt: -1 })
      .lean();
  }
}

module.exports = new DeliveryService();
