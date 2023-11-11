import matplotlib.pyplot as plt
import numpy as np
from sklearn.preprocessing import MinMaxScaler

# Cintas First Aid and Safety services revenue from 2006 to 2022
cintas_revenue = np.array([285, 362, 404, 378, 339, 378, 416, 461, 294, 327, 461, 461, 565, 619, 709, 784, 832])

# Number of firms in the US from 2006 to 2022
firms = np.array([7705018, 7601169, 7433465, 7396628, 7354043, 7431808, 7488353, 7563084])

# Trim the Cintas revenue data to match the years
cintas_revenue_trim = cintas_revenue[:len(firms)]

# Corresponding years
years = np.array(range(2006, 2006+len(firms)))

# Create scaler
scaler = MinMaxScaler()

# Fit and transform the data
firms_scaled = scaler.fit_transform(firms.reshape(-1, 1))
revenue_scaled = scaler.fit_transform(cintas_revenue_trim.reshape(-1, 1))

# Plot outputs
plt.figure(figsize=(14,8))
plt.plot(years, firms_scaled, label='Number of Firms')
plt.plot(years, revenue_scaled, label='Cintas First Aid and Safety Services Revenue')
plt.xlabel('Year')
plt.ylabel('Normalized Value')
plt.title('Normalized Comparison of the Number of Firms and Cintas First Aid and Safety Services Revenue (2006-2014)')
plt.legend()
plt.show()
