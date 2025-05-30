
// Haversine formula to calculate distance between two points on Earth
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

const calculateDeliveryFee = (storeLocation, customerLocation, deliveryType = 'standard') => {
  const distance = calculateDistance(
    storeLocation.latitude,
    storeLocation.longitude,
    customerLocation.latitude,
    customerLocation.longitude
  );

  // Base price: ₵5
  let fee = 5;

  // Add ₵1.50 for every full kilometer beyond the first 2 km
  if (distance > 2) {
    const extraKilometers = Math.floor(distance - 2);
    fee += extraKilometers * 1.5;
  }

  // Express delivery adds 20% surcharge
  if (deliveryType === 'express') {
    fee *= 1.2;
  }

  return {
    fee: Math.round(fee * 100) / 100, // Round to 2 decimal places
    distance: Math.round(distance * 100) / 100,
    basePrice: 5,
    distanceCharge: distance > 2 ? Math.floor(distance - 2) * 1.5 : 0,
    expressSurcharge: deliveryType === 'express' ? fee * 0.2 : 0
  };
};

module.exports = {
  calculateDistance,
  calculateDeliveryFee
};
