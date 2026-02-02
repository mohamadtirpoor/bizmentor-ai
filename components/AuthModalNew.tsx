import React, { useState, useEffect } from 'react';
import { X, Mail, ArrowRight, Check } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  o