import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

// Keyframe animations
const glowPulse = keyframes`
  0%, 100% { filter: drop-shadow(0 0 2px rgba(255, 215, 0, 0.7)); }
  50% { filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.9)); }
`;

const slideIn = keyframes`
  0% { transform: translateX(-100%) skewX(-45deg); opacity: 0; }
  100% { transform: translateX(0) skewX(0); opacity: 1; }
`;

const revealText = keyframes`
  0% { clip-path: polygon(0 0, 0 0, 0 100%, 0 100%); }
  100% { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); }
`;

const LogoContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  padding: '8px 12px',
  cursor: 'pointer',
  overflow: 'visible',
}));

const LogoShape = styled(Box)(({ theme, isadmin, darkmode }) => ({
  position: 'relative',
  width: '40px',
  height: '40px',
  background: 'transparent',
  perspective: '1000px',
  transformStyle: 'preserve-3d',
  animation: `${glowPulse} 2s infinite`,

  '&::before, &::after': {
    content: '""',
    position: 'absolute',
    width: '100%',
    height: '100%',
    background: darkmode === 'true' ? '#FFD700' : '#000',
    clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },

  '&::before': {
    transform: 'translateZ(-2px) rotate(0deg)',
  },

  '&::after': {
    background: darkmode === 'true' ? '#000' : '#FFD700',
    transform: 'translateZ(2px) rotate(45deg)',
  },

  '&:hover': {
    '&::before': {
      transform: 'translateZ(-2px) rotate(180deg)',
    },
    '&::after': {
      transform: 'translateZ(2px) rotate(225deg)',
    }
  }
}));

const TextContainer = styled(Box)(({ theme, darkmode }) => ({
  position: 'relative',
  marginLeft: '15px',
  overflow: 'hidden',
  animation: `${slideIn} 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards`,
  display: 'flex',
  alignItems: 'flex-start',
  flexDirection: 'column',
}));

const MainText = styled(Typography)(({ theme, darkmode }) => ({
  fontSize: '2rem',
  fontWeight: 900,
  letterSpacing: '0.1em',
  position: 'relative',
  fontFamily: "'Montserrat', sans-serif",
  background: darkmode === 'true' 
    ? 'linear-gradient(45deg, #FFD700 30%, #FDB931 90%)'
    : 'linear-gradient(45deg, #000000 30%, #333333 90%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  animation: `${revealText} 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards`,
  display: 'flex',
  alignItems: 'center',
  gap: '2px',
  marginBottom: '-5px',
  filter: darkmode === 'true' ? 'drop-shadow(0 0 2px rgba(255,215,0,0.5))' : 'none',

  '& .b-letter, & .k-letter': {
    display: 'inline-block',
    transition: 'transform 0.3s ease',
  },

  '& .b-letter': {
    transform: 'skewX(-5deg)',
  },

  '& .k-letter': {
    transform: 'skewX(5deg)',
  },

  '&:hover': {
    '& .b-letter': {
      transform: 'skewX(5deg)',
    },
    '& .k-letter': {
      transform: 'skewX(-5deg)',
    }
  }
}));

const SubText = styled(Typography)(({ theme, darkmode }) => ({
  fontSize: '1.1rem',
  fontWeight: 500,
  letterSpacing: '0.2em',
  background: darkmode === 'true' 
    ? 'linear-gradient(45deg, #FFFFFF 20%, #FFD700 50%, #FFFFFF 80%)'
    : 'linear-gradient(45deg, #666666 20%, #000000 50%, #666666 80%)',
  backgroundSize: '200% auto',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  textTransform: 'uppercase',
  position: 'relative',
  opacity: 0,
  animation: `${revealText} 0.5s 0.3s cubic-bezier(0.23, 1, 0.32, 1) forwards`,
  transform: 'translateX(4px)',
  transition: 'all 0.3s ease',
  paddingLeft: '2px',
  filter: darkmode === 'true' ? 'drop-shadow(0 0 1px rgba(255,255,255,0.5))' : 'none',

  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '-12px',
    width: '8px',
    height: '2px',
    background: darkmode === 'true' ? '#FFD700' : '#000',
    transform: 'scaleX(0)',
    transformOrigin: 'right',
    transition: 'transform 0.3s ease',
  },

  '&:hover': {
    backgroundPosition: 'right center',
    letterSpacing: '0.25em',
    transform: 'translateX(12px)',

    '&::before': {
      transform: 'scaleX(1)',
    }
  }
}));

const Logo = ({ variant = 'default', darkMode = false }) => {
  const isAdmin = variant === 'admin';
  
  return (
    <LogoContainer>
      <LogoShape className="logo-shape" isadmin={isAdmin ? 'true' : 'false'} darkmode={darkMode ? 'true' : 'false'}>
        <Typography
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: darkMode ? '#FFD700' : '#000',
            fontWeight: 900,
            fontSize: '1.2rem',
            zIndex: 2,
            fontFamily: "'Montserrat', sans-serif",
            textShadow: darkMode ? '0 0 5px rgba(255,215,0,0.5)' : 'none',
          }}
        >
          B
        </Typography>
      </LogoShape>
      
      <TextContainer darkmode={darkMode ? 'true' : 'false'}>
        <MainText darkmode={darkMode ? 'true' : 'false'}>
          <span className="b-letter">B</span>
          <span className="k-letter">K</span>
        </MainText>
        <SubText darkmode={darkMode ? 'true' : 'false'} className="rental-text">
          RENTAL
        </SubText>
      </TextContainer>
    </LogoContainer>
  );
};

export default Logo;
