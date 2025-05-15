import React from 'react';
import { Box, Typography } from '@mui/material';

function UnderConstruction() {
    return (
        <Box 
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '80vh',
                padding: '20px'
            }}
        >
            <img 
                src={"/uploads/icons/page1.png"} 
                alt="페이지 준비중" 
                style={{
                    maxWidth: '300px',
                    marginBottom: '20px'
                }}
            />
            {/* <Typography variant="h5" sx={{ color: '#666' }}>
                페이지 준비중입니다
            </Typography> */}
            <Typography variant="body1" sx={{ color: '#888', mt: 2 }}>
                더 나은 서비스를 위해 준비중입니다. 조금만 기다려주세요!
            </Typography>
        </Box>
    );
}   

export default UnderConstruction; 