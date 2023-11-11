import numpy as np
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression
from scipy.stats import pearsonr
from sklearn.metrics import mean_squared_error
from sklearn.preprocessing import MinMaxScaler

# Cintas net profit from 2003 to 2022
# cintas_profit = np.array([243, 265, 293, 323, 334, 335, 226, 216, 247, 281, 306, 338, 411, 457, 481, 885, 876, 1111, 1059, 1198])

cintas_profit = np.array([885, 876, 1111, 1059, 1198])

# # US corporate profit from 2002 to 2021 (quarterly)
# corporate_profit_quarterly = np.array([685.452, 749.824, 813.945, 904.966, 921.467, 919.833, 981.564, 1057.618, 1179.638, 1239.285, 1302.93,
#                                         1308.967, 1604.404, 1616.546, 1667.23, 1772.577, 1809.292, 1857.786, 1896.081, 1813.484, 1744.562, 1814.11,
#                                         1722.347, 1726.757, 1558.756, 1570.559, 1496.693, 891.223, 1254.684, 1356.958, 1553.371, 1704.953, 1786.945,
#                                         1779.315, 1879.334, 1890.461, 1749.344, 1814.197, 1795.846, 1913.534, 2199.909, 2135.981, 2160.051, 2128.47,
#                                         2127.093, 2114.721, 2157.51, 2206.766, 2171.327, 2290.948, 2315.635, 2279.979, 2185.428, 2208.945, 2123.057,
#                                         1995.626, 2071.8, 2137.312, 2139.392, 2188.432, 2211.66, 2204.233, 2274.236, 2088.22, 2202.037, 2258.834,
#                                         2274.868, 2295.174, 2254.933, 2311.3, 2269.075, 2383.929, 2202.657, 2078.07, 2702.715, 2615.907, 2937.989,
#                                         3209.367, 3214.189, 3190.746])

# US corporate profit from 2002 to 2021 (quarterly)
corporate_profit_quarterly = np.array([2211.66, 2204.233, 2274.236, 2088.22, 2202.037, 2258.834,
                                        2274.868, 2295.174, 2254.933, 2311.3, 2269.075, 2383.929, 2202.657, 2078.07, 2702.715, 2615.907, 2937.989,
                                        3209.367, 3214.189, 3190.746])
# Reshape to annual data
corporate_profit_annual = corporate_profit_quarterly.reshape(-1, 4).sum(axis=1)

# Create a scaler object
scaler = MinMaxScaler()

# Fit and transform the data
cintas_profit_norm = scaler.fit_transform(cintas_profit.reshape(-1, 1))
corporate_profit_annual_norm = scaler.fit_transform(corporate_profit_annual.reshape(-1, 1))

corr, _ = pearsonr(cintas_profit_norm.flatten(), corporate_profit_annual_norm.flatten())
print(f"Pearson correlation: {corr:.3f}")

# Plot
plt.figure(figsize=(10,6))
plt.plot(range(2002, 2023), cintas_profit_norm, label='Cintas Profit (Normalized)')
plt.plot(range(2002, 2023), corporate_profit_annual_norm, label='US Corporate Profit (Normalized)')
plt.legend()
plt.title('Normalized Cintas Profit and US Corporate Profit (2002 - 2022)')
plt.xlabel('Year')
plt.ylabel('Normalized Profit')
plt.show()
