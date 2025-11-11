import React, { useRef } from 'react';
import './ExploreEquipment.css';
import { equipment_list } from '../../assets/assets';

const ExploreEquipment = () => {
  const scrollRef = useRef();

  // Track mouse state
  const handleMouseDown = (e) => {
    const slider = scrollRef.current;
    slider.isDown = true;
    slider.startX = e.pageX - slider.offsetLeft;
    slider.scrollLeftStart = slider.scrollLeft;
  };

  const handleMouseLeave = () => {
    scrollRef.current.isDown = false;
  };

  const handleMouseUp = () => {
    scrollRef.current.isDown = false;
  };

  const handleMouseMove = (e) => {
    const slider = scrollRef.current;
    if (!slider.isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - slider.startX) * 1.5; // scroll speed
    slider.scrollLeft = slider.scrollLeftStart - walk;
  };

  return (
    <div className="explore-equipment" id="explore-equipment">
      <h1>Explore Available Equipment</h1>
      <p className="explore-equipment-text">
        Order your required medical equipment easily from our available collection to ensure fast, reliable, and quality healthcare support.
      </p>

      <div
        className="explore-equipment-list"
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {equipment_list.map((item, index) => (
          <div key={index} className="explore-equipment-list-item">
            <img src={item.equipment_image} alt={item.equipment_name} />
            <p>{item.equipment_name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExploreEquipment;
