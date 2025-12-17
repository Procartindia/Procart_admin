// // SpecificationComponent.js
// import React from 'react';

// const SpecificationComponent = ({ itemData, itemType }) => {
//   const getSpecifications = () => {
//     switch (itemType) {
//       case 'trending':
//         return {
//           Microcontroller: itemData.microcontroller || 'N/A',
//           'Operating Voltage': itemData.operatingVoltage || 'N/A',
//           'Input Voltage (Recommended)': itemData.inputVoltageRecommended || 'N/A',
//           'Input Voltage (Limits)': itemData.inputVoltageLimits || 'N/A',
//           'Digital I/O Pins': itemData.digitalIOPins || 'N/A',
//           'Analog Input Pins': itemData.analogInputPins || 'N/A',
//           'PWM Channels': itemData.pwmChannels || 'N/A',
//           'Clock Speed': itemData.clockSpeed || 'N/A',
//           'Flash Memory': itemData.flashMemory || 'N/A',
//           'SRAM': itemData.sram || 'N/A',
//           'EEPROM': itemData.eeprom || 'N/A',
//           'USB Interface': itemData.usbInterface || 'N/A',
//           'Communication Interfaces': itemData.communicationInterfaces || 'N/A',
//           'Dimensions': itemData.dimensions || 'N/A',
//           'Weight': itemData.weight || 'N/A',
//           'Operating Temperature': itemData.operatingTemperature || 'N/A',
//           'Power Consumption': itemData.powerConsumption || 'N/A',
//           'LED Indicators': itemData.ledIndicators || 'N/A',
//         };
//       case 'categoryItems':
//         return {
//           'Category Name': itemData.categoryName || 'N/A',
//           'Item Name': itemData.name || 'N/A',
//           'Price': itemData.price ? `₹${itemData.price.toFixed(2)}` : 'N/A',
//           'Material': itemData.material || 'N/A',
//           'Dimensions': itemData.dimensions || 'N/A',
//           'Weight': itemData.weight || 'N/A',
//           'Warranty': itemData.warranty || 'N/A',
//           'Delivery Speed': itemData.deliverySpeed || 'N/A',
//         };
//       default:
//         return {};
//     }
//   };

//   const specifications = getSpecifications();

//   return (
//     <div className="card spec-card">
//       <h2>Specifications of {itemData.name || 'Uploaded Item'}</h2>
//       <table>
//         <tbody>
//           {Object.entries(specifications).map(([key, value]) => (
//             <tr key={key}>
//               <td>{key}</td>
//               <td>{value}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default SpecificationComponent;


import React from 'react';
import './SpecificationComponent.css';

const SpecificationComponent = ({ itemData, itemType }) => {
  const getSpecifications = () => {
    let specs = {};
    
    switch (itemType) {
      case 'trending':
        specs = {
          Microcontroller: itemData.microcontroller || '',
          'Operating Voltage': itemData.operatingVoltage || '',
          'Input Voltage (Recommended)': itemData.inputVoltageRecommended || '',
          'Input Voltage (Limits)': itemData.inputVoltageLimits || '',
          'Digital I/O Pins': itemData.digitalIOPins || '',
          'Analog Input Pins': itemData.analogInputPins || '',
          'PWM Channels': itemData.pwmChannels || '',
          'Clock Speed': itemData.clockSpeed || '',
          'Flash Memory': itemData.flashMemory || '',
          'SRAM': itemData.sram || '',
          'EEPROM': itemData.eeprom || '',
          'USB Interface': itemData.usbInterface || '',
          'Communication Interfaces': itemData.communicationInterfaces || '',
          'Dimensions': itemData.dimensions || '',
          'Weight': itemData.weight || '',
          'Operating Temperature': itemData.operatingTemperature || '',
          'Power Consumption': itemData.powerConsumption || '',
          'LED Indicators': itemData.ledIndicators || '',
        };
        break;
      case 'categories':
        specs = {
          'Category Name': itemData.name || '',
          'Description': itemData.description || '',
          'Status': itemData.active ? 'Active' : 'Inactive',
        };
        break;
      case 'categoryItems':
        specs = {
          'Category Name': itemData.categoryName || '',
          'Item Name': itemData.name || '',
          'Original Price': itemData.originalPrice ? `₹${parseFloat(itemData.originalPrice).toFixed(2)}` : '',
          'Discount': itemData.discountPercentage ? `${parseFloat(itemData.discountPercentage).toFixed(2)}%` : '',
          'Selling Price': itemData.price ? `₹${parseFloat(itemData.price).toFixed(2)}` : '',
          'Material': itemData.material || '',
          'Dimensions': itemData.dimensions || '',
          'Weight': itemData.weight || '',
          'Warranty': itemData.warranty || '',
          'Delivery Speed': itemData.deliverySpeed ? itemData.deliverySpeed.charAt(0).toUpperCase() + itemData.deliverySpeed.slice(1) : '',
        };
        break;
      default:
        return {};
    }

    // Filter out empty specifications
    const filteredSpecs = Object.fromEntries(
      Object.entries(specs).filter(([key, value]) => value && value.trim() !== '')
    );

    // Add custom specifications
    if (itemData.customSpecifications && itemData.customSpecifications.length > 0) {
      itemData.customSpecifications.forEach(spec => {
        if (spec.title && spec.value) {
          filteredSpecs[spec.title] = spec.value;
        }
      });
    }

    return filteredSpecs;
  };

  const specifications = getSpecifications();

  return (
    <div className="card spec-card">
      <h2>Specifications of {itemData.name || 'Uploaded Item'}</h2>
      
      {/* Basic specifications */}
      {Object.keys(specifications).length > 0 ? (
        <table className="spec-table">
          <tbody>
            {Object.entries(specifications).map(([key, value]) => (
              <tr key={key}>
                <td className="spec-name">{key}</td>
                <td className="spec-value">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="no-specs-message">No specifications added yet</p>
      )}

      {/* Package Points */}
      {itemData.packagePoints && itemData.packagePoints.length > 0 && (
        <div className="package-points-section">
          <h3>Package Contents</h3>
          <ul className="package-points-list">
            {itemData.packagePoints.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Key Features */}
      {itemData.keyFeatures && itemData.keyFeatures.length > 0 && (
        <div className="package-points-section">
          <h3>Key Features</h3>
          <ul className="package-points-list">
            {itemData.keyFeatures.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Applications */}
      {itemData.applications && itemData.applications.length > 0 && (
        <div className="package-points-section">
          <h3>Applications</h3>
          <ul className="package-points-list">
            {itemData.applications.map((application, index) => (
              <li key={index}>{application}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SpecificationComponent;