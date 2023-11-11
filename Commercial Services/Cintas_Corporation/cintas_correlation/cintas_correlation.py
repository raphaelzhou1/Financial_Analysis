# import matplotlib.pyplot as plt
# import seaborn as sns
# import numpy as np
# from sklearn.linear_model import LinearRegression
# from scipy.stats import pearsonr
# from sklearn.preprocessing import MinMaxScaler
#
# # Cintas revenue from 2006 to 2022
# cintas_revenue = np.array([2569, 2735, 2835, 2755, 2569, 2692, 2912, 3044, 3305, 3541, 3777, 4202, 5247, 5552, 5643, 5690, 6227])
#
# # Number of firms in the US from 2006 to 2020
# firms = np.array([7601160, 7705018, 7601169, 7433465, 7396628, 7354043, 7431808, 7488353, 7563084, 6872174, 6979570, 7860674, 7912405, 7959103, 8000178])
#
# # Trim the Cintas revenue data to match the years
# cintas_revenue_trim = cintas_revenue[:len(firms)]
#
# # Corresponding years
# years = np.array(range(2006, 2021)).reshape(-1, 1)
#
# # Create linear regression object for firms
# regr_firms = LinearRegression()
# regr_firms.fit(years, firms)
#
# # Create linear regression object for Cintas revenue
# regr_revenue = LinearRegression()
# regr_revenue.fit(years, cintas_revenue_trim)
#
# # Make predictions using the testing set
# firms_pred = regr_firms.predict(years)
# revenue_pred = regr_revenue.predict(years)
#
# # Check the correlation
# corr, _ = pearsonr(firms, cintas_revenue_trim)
# corr_text = f"Pearson correlation coefficient between the number of firms and Cintas's revenue is {corr:.2f}"
#
# # Create scaler
# scaler = MinMaxScaler()
#
# # Fit and transform the data
# firms_scaled = scaler.fit_transform(firms.reshape(-1, 1))
# revenue_scaled = scaler.fit_transform(cintas_revenue_trim.reshape(-1, 1))
#
# # Plot outputs
# plt.figure(figsize=(14,8))
# sns.set_style("whitegrid")
# plt.scatter(years, firms_scaled,  color='black', label='Firms Observed')
# plt.scatter(years, revenue_scaled, color='red', label='Cintas Revenue Observed')
# plt.title('Number of firms and Cintas Revenue from 2006 to 2020 (Scaled)')
# plt.xlabel('Year')
# plt.ylabel('Normalized Count / Revenue')
# plt.legend()
# plt.show()
