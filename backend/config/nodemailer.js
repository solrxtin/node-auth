

const nodemailerTransporter = async () => {
    try {
        

        return transporter
    
    } catch (error) {
        console.error(error.message);
        throw new Error(error.message);
    }
}

export default nodemailerTransporter
