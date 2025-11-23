import React, { useState, useEffect, useContext } from 'react';
import { Calendar, ChevronRight } from 'lucide-react';
import { useAppointments } from '../hooks/client/useClientProfile';
import { EmailContext } from '../utils/EmailContext';


