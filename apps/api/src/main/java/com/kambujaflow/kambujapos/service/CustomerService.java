package com.kambujaflow.kambujapos.service;

import com.kambujaflow.kambujapos.common.ResourceNotFoundException;
import com.kambujaflow.kambujapos.dto.request.CustomerRequest;
import com.kambujaflow.kambujapos.dto.response.CustomerResponse;
import com.kambujaflow.kambujapos.entity.Customer;
import com.kambujaflow.kambujapos.repository.CustomerRepository;
import com.kambujaflow.kambujapos.security.ShopScopeGuard;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerService {
    private final CustomerRepository customerRepository;
    private final ShopScopeGuard shopScopeGuard;
    private final AuditLogService auditLogService;

    public CustomerResponse create(CustomerRequest request) {
        Customer customer = customerRepository.save(map(
                new Customer(),
                shopScopeGuard.currentShopId(),
                request
        ));
        auditLogService.log("CREATE", "customers", customer.getId(), null, customer);
        return toResponse(customer);
    }

    public CustomerResponse update(String id, CustomerRequest request) {
        Customer customer = getEntity(id);
        String oldValue = customer.toString();
        Customer saved = customerRepository.save(map(customer, customer.getShopId(), request));
        auditLogService.log("UPDATE", "customers", id, oldValue, saved);
        return toResponse(saved);
    }

    public void delete(String id) {
        Customer customer = getEntity(id);
        customerRepository.delete(customer);
        auditLogService.log("DELETE", "customers", id, customer, null);
    }

    public List<CustomerResponse> list() {
        return customerRepository.findByShopIdOrderByNameAsc(shopScopeGuard.currentShopId())
                .stream().map(this::toResponse).toList();
    }

    public Customer getEntity(String id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        shopScopeGuard.verify(customer.getShopId());
        return customer;
    }

    private Customer map(Customer customer, String shopId, CustomerRequest request) {
        customer.setShopId(shopId);
        customer.setName(request.getName().trim());
        customer.setPhone(request.getPhone());
        customer.setEmail(request.getEmail());
        customer.setAddress(request.getAddress());
        customer.setCountry(request.getCountry());
        customer.setCity(request.getCity());
        customer.setProvince(request.getProvince());
        customer.setPostalCode(request.getPostalCode());
        customer.setStatus(request.getStatus() == null ? 1 : request.getStatus());
        return customer;
    }

    private CustomerResponse toResponse(Customer customer) {
        return CustomerResponse.builder()
                .id(customer.getId())
                .shopId(customer.getShopId())
                .name(customer.getName())
                .phone(customer.getPhone())
                .email(customer.getEmail())
                .address(customer.getAddress())
                .country(customer.getCountry())
                .city(customer.getCity())
                .province(customer.getProvince())
                .postalCode(customer.getPostalCode())
                .status(customer.getStatus())
                .createdAt(customer.getCreatedAt())
                .updatedAt(customer.getUpdatedAt())
                .build();
    }
}
