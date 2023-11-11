
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from sklearn.linear_model import LinearRegression
from scipy.stats import pearsonr
from sklearn.preprocessing import MinMaxScaler

# Cintas revenue from 2007 to 2015
cintas_revenue_lag = np.array([2835, 2755, 2569, 2692, 2912, 3044, 3305, 3541])

# Number of firms in the US from 2006 to 2014
firms = np.array([7705018, 7601169, 7433465, 7396628, 7354043, 7431808, 7488353, 7563084])

# Calculate the percentage changes
cintas_revenue_pct_change = np.diff(cintas_revenue_lag) / cintas_revenue_lag[:-1] * 100
firms_pct_change = np.diff(firms) / firms[:-1] * 100

# Check the correlation between percentage changes
corr_pct_change, _ = pearsonr(cintas_revenue_pct_change, firms_pct_change)
corr_text_pct_change = f"Pearson correlation coefficient between the percentage changes in the number of firms and Cintas's revenue is {corr_pct_change:.2f}"

print(corr_text_pct_change)

# Create scaler
scaler = MinMaxScaler()

# Fit and transform the data
firms_scaled = scaler.fit_transform(firms.reshape(-1, 1))
revenue_scaled_lag = scaler.fit_transform(cintas_revenue_lag.reshape(-1, 1))

# Check the correlation
corr_lag, _ = pearsonr(firms_scaled.ravel(), revenue_scaled_lag.ravel())
corr_text_lag = f"Pearson correlation coefficient between the number of firms and Cintas's revenue (lag-1) is {corr_lag:.2f}"

print(corr_text_lag)

# Corresponding years
years = np.array(range(2006, 2014)).reshape(-1, 1)

# Create linear regression object for firms
regr_firms = LinearRegression()
regr_firms.fit(years, firms_scaled)

# Create linear regression object for Cintas revenue
regr_revenue = LinearRegression()
regr_revenue.fit(years, revenue_scaled)

# Make predictions using the testing set
firms_pred = regr_firms.predict(years)
revenue_pred = regr_revenue.predict(years)

# Plot outputs
plt.figure(figsize=(14,8))
sns.set_style("whitegrid")
plt.scatter(years, firms_scaled,  color='black', label='Firms Observed')
plt.scatter(years, revenue_scaled, color='red', label='Cintas Revenue Observed')
plt.plot(years, firms_pred, color='blue', linewidth=3, label='Firms Fitted')
plt.plot(years, revenue_pred, color='green', linewidth=3, label='Cintas Revenue Fitted')
plt.title('Number of firms and Cintas Revenue from 2006 to 2014 (Scaled)')
plt.xlabel('Year')
plt.ylabel('Normalized Count / Revenue')
plt.legend()
plt.show()

print(corr_text)
