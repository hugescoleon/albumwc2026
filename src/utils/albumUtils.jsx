import React from 'react';
import { Trophy, Bookmark, LayoutDashboard, Package } from 'lucide-react';

export const getSectionTheme = (id) => {
  const albumGuide = {
    // Special Sections (Dark Grey as requested)
    'FWC': { g: 'INT', p: "2-7", color: 'border-[#333333]', bg: 'bg-[#333333]/10', icon: <Trophy size={14} className="text-white" /> },
    'MUS': { g: 'MUS', p: "108-109", color: 'border-[#333333]', bg: 'bg-[#333333]/10', icon: <LayoutDashboard size={14} className="text-white" /> },
    'COC': { g: 'COC', p: "110", color: 'border-[#FE001A]', bg: 'bg-[#FE001A]/10', icon: <Package size={14} className="text-white" /> },
    
    // Group A (Bright Green)
    'MEX': { g: 'A', p: "8-9", color: 'border-[#58B55B]', bg: 'bg-[#58B55B]/10', flag: 'mx' },
    'RSA': { g: 'A', p: "10-11", color: 'border-[#58B55B]', bg: 'bg-[#58B55B]/10', flag: 'za' },
    'KOR': { g: 'A', p: "12-13", color: 'border-[#58B55B]', bg: 'bg-[#58B55B]/10', flag: 'kr' },
    'CZE': { g: 'A', p: "14-15", color: 'border-[#58B55B]', bg: 'bg-[#58B55B]/10', flag: 'cz' },
    // Group B (Vibrant Red)
    'CAN': { g: 'B', p: "16-17", color: 'border-[#E3342F]', bg: 'bg-[#E3342F]/10', flag: 'ca' },
    'BIH': { g: 'B', p: "18-19", color: 'border-[#E3342F]', bg: 'bg-[#E3342F]/10', flag: 'ba' },
    'QAT': { g: 'B', p: "20-21", color: 'border-[#E3342F]', bg: 'bg-[#E3342F]/10', flag: 'qa' },
    'SUI': { g: 'B', p: "22-23", color: 'border-[#E3342F]', bg: 'bg-[#E3342F]/10', flag: 'ch' },
    // Group C (Olive/Lime)
    'BRA': { g: 'C', p: "24-25", color: 'border-[#D4D945]', bg: 'bg-[#D4D945]/10', flag: 'br' },
    'MAR': { g: 'C', p: "26-27", color: 'border-[#D4D945]', bg: 'bg-[#D4D945]/10', flag: 'ma' },
    'HAI': { g: 'C', p: "28-29", color: 'border-[#D4D945]', bg: 'bg-[#D4D945]/10', flag: 'ht' },
    'SCO': { g: 'C', p: "30-31", color: 'border-[#D4D945]', bg: 'bg-[#D4D945]/10', flag: 'gb-sct' },
    // Group D (Deep Indigo)
    'USA': { g: 'D', p: "32-33", color: 'border-[#4C51BF]', bg: 'bg-[#4C51BF]/10', flag: 'us' },
    'PAR': { g: 'D', p: "34-35", color: 'border-[#4C51BF]', bg: 'bg-[#4C51BF]/10', flag: 'py' },
    'AUS': { g: 'D', p: "36-37", color: 'border-[#4C51BF]', bg: 'bg-[#4C51BF]/10', flag: 'au' },
    'TUR': { g: 'D', p: "38-39", color: 'border-[#4C51BF]', bg: 'bg-[#4C51BF]/10', flag: 'tr' },
    // Group E (Coral Red)
    'GER': { g: 'E', p: "40-41", color: 'border-[#F66D44]', bg: 'bg-[#F66D44]/10', flag: 'de' },
    'CUW': { g: 'E', p: "42-43", color: 'border-[#F66D44]', bg: 'bg-[#F66D44]/10', flag: 'cw' },
    'CIV': { g: 'E', p: "44-45", color: 'border-[#F66D44]', bg: 'bg-[#F66D44]/10', flag: 'ci' },
    'ECU': { g: 'E', p: "46-47", color: 'border-[#F66D44]', bg: 'bg-[#F66D44]/10', flag: 'ec' },
    // Group F (Forest Green)
    'NED': { g: 'F', p: "48-49", color: 'border-[#2D5E56]', bg: 'bg-[#2D5E56]/10', flag: 'nl' },
    'JPN': { g: 'F', p: "50-51", color: 'border-[#2D5E56]', bg: 'bg-[#2D5E56]/10', flag: 'jp' },
    'SWE': { g: 'F', p: "52-53", color: 'border-[#2D5E56]', bg: 'bg-[#2D5E56]/10', flag: 'se' },
    'TUN': { g: 'F', p: "54-55", color: 'border-[#2D5E56]', bg: 'bg-[#2D5E56]/10', flag: 'tn' },
    // Group G (Soft Purple)
    'BEL': { g: 'G', p: "58-59", color: 'border-[#9F7AEA]', bg: 'bg-[#9F7AEA]/10', flag: 'be' },
    'EGY': { g: 'G', p: "60-61", color: 'border-[#9F7AEA]', bg: 'bg-[#9F7AEA]/10', flag: 'eg' },
    'IRN': { g: 'G', p: "62-63", color: 'border-[#9F7AEA]', bg: 'bg-[#9F7AEA]/10', flag: 'ir' },
    'NZL': { g: 'G', p: "64-65", color: 'border-[#9F7AEA]', bg: 'bg-[#9F7AEA]/10', flag: 'nz' },
    // Group H (Cyan/Teal)
    'ESP': { g: 'H', p: "66-67", color: 'border-[#4FD1C5]', bg: 'bg-[#4FD1C5]/10', flag: 'es' },
    'CPV': { g: 'H', p: "68-69", color: 'border-[#4FD1C5]', bg: 'bg-[#4FD1C5]/10', flag: 'cv' },
    'KSA': { g: 'H', p: "70-71", color: 'border-[#4FD1C5]', bg: 'bg-[#4FD1C5]/10', flag: 'sa' },
    'URU': { g: 'H', p: "72-73", color: 'border-[#4FD1C5]', bg: 'bg-[#4FD1C5]/10', flag: 'uy' },
    // Group I (Royal Purple)
    'FRA': { g: 'I', p: "74-75", color: 'border-[#6B46C1]', bg: 'bg-[#6B46C1]/10', flag: 'fr' },
    'SEN': { g: 'I', p: "76-77", color: 'border-[#6B46C1]', bg: 'bg-[#6B46C1]/10', flag: 'sn' },
    'IRQ': { g: 'I', p: "78-79", color: 'border-[#6B46C1]', bg: 'bg-[#6B46C1]/10', flag: 'iq' },
    'NOR': { g: 'I', p: "80-81", color: 'border-[#6B46C1]', bg: 'bg-[#6B46C1]/10', flag: 'no' },
    // Group J (Rose)
    'ARG': { g: 'J', p: "82-83", color: 'border-[#F687B3]', bg: 'bg-[#F687B3]/10', flag: 'ar' },
    'ALG': { g: 'J', p: "84-85", color: 'border-[#F687B3]', bg: 'bg-[#F687B3]/10', flag: 'dz' },
    'AUT': { g: 'J', p: "86-87", color: 'border-[#F687B3]', bg: 'bg-[#F687B3]/10', flag: 'at' },
    'JOR': { g: 'J', p: "88-89", color: 'border-[#F687B3]', bg: 'bg-[#F687B3]/10', flag: 'jo' },
    // Group K (Magenta)
    'POR': { g: 'K', p: "90-91", color: 'border-[#D53F8C]', bg: 'bg-[#D53F8C]/10', flag: 'pt' },
    'COD': { g: 'K', p: "92-93", color: 'border-[#D53F8C]', bg: 'bg-[#D53F8C]/10', flag: 'cd' },
    'UZB': { g: 'K', p: "94-95", color: 'border-[#D53F8C]', bg: 'bg-[#D53F8C]/10', flag: 'uz' },
    'COL': { g: 'K', p: "96-97", color: 'border-[#D53F8C]', bg: 'bg-[#D53F8C]/10', flag: 'co' },
    // Group L (Maroon/Earth)
    'ENG': { g: 'L', p: "98-99", color: 'border-[#822722]', bg: 'bg-[#822722]/10', flag: 'gb-eng' },
    'CRO': { g: 'L', p: "100-101", color: 'border-[#822722]', bg: 'bg-[#822722]/10', flag: 'hr' },
    'GHA': { g: 'L', p: "102-103", color: 'border-[#822722]', bg: 'bg-[#822722]/10', flag: 'gh' },
    'PAN': { g: 'L', p: "104-105", color: 'border-[#822722]', bg: 'bg-[#822722]/10', flag: 'pa' },
  };

  return albumGuide[id] || { g: '?', p: '?', color: 'border-gold', bg: 'bg-gold/10', flag: null };
};

/**
 * Returns an array of sticker IDs for a given section.
 * Handles special cases like FWC (00-8).
 */
export const getSectionStickerIds = (sectionId, total) => {
  return Array.from({ length: total }, (_, i) => {
    if (sectionId === 'FWC') {
      return i === 0 ? 'FWC-00' : `FWC-${i}`;
    }
    if (sectionId === 'MUS') {
      return `MUS-${i + 9}`;
    }
    return `${sectionId}-${i + 1}`;
  });
};

/**
 * Returns the human-readable number/label for a sticker ID.
 * Handles special cases like FWC-00 -> "00".
 */
export const getStickerDisplayNum = (stickerId) => {
  if (stickerId === 'FWC-00') return '00';
  if (stickerId.startsWith('FWC-')) return stickerId.replace('FWC-', '');
  const parts = stickerId.split('-');
  return parts.length > 1 ? parts[1] : stickerId;
};

